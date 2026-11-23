import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { buildUserLegalPrompt, VAKAALAT_SYSTEM_PROMPT } from '../prompts/vakaalatLegalPrompt.js';
import { getCompactLearnedHint } from './experienceStore.js';
import { maskSensitiveDetails } from './privacyMasker.js';

export class GeminiKeyMissingError extends Error {
  public readonly code = 'GEMINI_KEY_REQUIRED';
  constructor() {
    super('GEMINI_API_KEY is not configured in backend/.env. Live Gemini legal computation requires a valid API key.');
  }
}

const VakaalatComputationSchema = z.object({
  detectedCategory: z.enum([
    'Theft & Cyber',
    'Criminal',
    'Marital',
    'Property',
    'Consumer',
    'Labour',
    'Financial',
  ]),
  suggestedPostTitle: z.string().min(4),
  pillar1_violations: z.object({
    totalDharasViolated: z.number().int().min(1),
    compassionateValidation: z.string().min(10),
    violations: z
      .array(
        z.object({
          code: z.string(),
          title: z.string(),
          whyItAppliesToYourStory: z.string(),
        })
      )
      .min(1),
  }),
  pillar2_accountability: z.object({
    jailTime: z.string(),
    finesAndCompensation: z.string(),
    otherRemedies: z.string(),
  }),
  pillar3_seriousness: z.object({
    level: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
    scoreOutOf10: z.number().int().min(1).max(10),
    beyondFirstAid: z.boolean(),
    explanation: z.string(),
    lawyerRecommendation: z.string(),
  }),
  pillar4_digitalFirstAid: z.object({
    immediateSteps: z.array(z.string()).min(2),
    govPortals: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          helpline: z.string().optional(),
          purpose: z.string(),
          hoverSteps: z.array(z.string()).min(2),
        })
      )
      .min(1),
    youtubeKnowledgeGuides: z
      .array(
        z.object({
          title: z.string(),
          searchQuery: z.string(),
          trailerText: z.string(),
        })
      )
      .min(1),
  }),
});

export type ComputedLegalAnalysis = z.infer<typeof VakaalatComputationSchema> & {
  youtubeGuidesWithUrls: {
    title: string;
    searchUrl: string;
    trailerText: string;
  }[];
  draftPostMasked: string;
  draftPostRaw: string;
  poweredBy: string;
};

export const ACTIVE_GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
const GEMINI_MODEL_CHAIN = [
  ACTIVE_GEMINI_MODEL,
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function runJollyAssistant(
  userQuery: string,
  language: 'en' | 'hi' | 'hinglish' = 'en',
  authorRealName?: string
): Promise<ComputedLegalAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiKeyMissingError();
  }

  const ai = new GoogleGenAI({ apiKey });
  const { maskedContent } = maskSensitiveDetails(userQuery, authorRealName);

  const schemaInstruction = `
Return ONLY a JSON object with this EXACT structure (no markdown fences, no extra text):
{
  "detectedCategory": "Criminal",
  "suggestedPostTitle": "string",
  "pillar1_violations": {
    "totalDharasViolated": 3,
    "compassionateValidation": "string",
    "violations": [{ "code": "string", "title": "string", "whyItAppliesToYourStory": "string" }]
  },
  "pillar2_accountability": {
    "jailTime": "string",
    "finesAndCompensation": "string",
    "otherRemedies": "string"
  },
  "pillar3_seriousness": {
    "level": "HIGH",
    "scoreOutOf10": 8,
    "beyondFirstAid": true,
    "explanation": "string",
    "lawyerRecommendation": "string"
  },
  "pillar4_digitalFirstAid": {
    "immediateSteps": ["First, ...", "Then, ...", "Next, ..."],
    "govPortals": [
      {
        "name": "string",
        "url": "https://...",
        "helpline": "optional string",
        "purpose": "string",
        "hoverSteps": ["step 1", "step 2", "step 3"]
      }
    ],
    "youtubeKnowledgeGuides": [
      {
        "title": "string",
        "searchQuery": "string",
        "trailerText": "string"
      }
    ]
  }
}`;

  let rawText = '';
  let usedModel = ACTIVE_GEMINI_MODEL;
  let lastErr: any = null;

  const learnedHint = getCompactLearnedHint();
  const compactSystem = learnedHint
    ? `${VAKAALAT_SYSTEM_PROMPT}\n\n${learnedHint}`
    : VAKAALAT_SYSTEM_PROMPT;

  for (const modelName of [...new Set(GEMINI_MODEL_CHAIN)]) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `${buildUserLegalPrompt(userQuery, language)}\n\n${schemaInstruction}`,
        config: {
          systemInstruction: compactSystem,
          responseMimeType: 'application/json',
          temperature: 0.35,
        },
      });
      rawText = (response.text || '').trim();
      if (rawText) {
        usedModel = modelName;
        break;
      }
    } catch (err: any) {
      lastErr = err;
      const status = err?.status || err?.code;
      if (status === 404 || status === 503 || status === 429) {
        continue;
      }
      throw err;
    }
  }

  if (!rawText) {
    throw lastErr || new Error('Gemini returned an empty response. Please try again.');
  }

  let jsonObj: unknown;
  try {
    jsonObj = JSON.parse(rawText);
  } catch {
    throw new Error('Gemini returned malformed JSON. Please try submitting again.');
  }

  const parsed = VakaalatComputationSchema.safeParse(jsonObj);
  if (!parsed.success) {
    throw new Error(`Legal engine validation failed: ${parsed.error.issues[0]?.message || 'Incomplete output'}`);
  }

  const youtubeGuidesWithUrls = parsed.data.pillar4_digitalFirstAid.youtubeKnowledgeGuides.map((g) => ({
    title: g.title,
    searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(g.searchQuery)}`,
    trailerText: g.trailerText,
  }));

  return {
    ...parsed.data,
    youtubeGuidesWithUrls,
    draftPostMasked: maskedContent,
    draftPostRaw: userQuery,
    poweredBy: usedModel,
  };
}

const DraftPostSchema = z.object({
  title: z.string().min(6),
  body: z.string().min(20),
});

/**
 * Uses Gemini live to craft an emotionally authentic, anonymous Court of People post
 * preserving the citizen's voice and sentiments while keeping PII safe.
 */
export async function draftCourtOfPeoplePost(
  userStory: string,
  category: string,
  dharas: string[],
  language: 'en' | 'hi' | 'hinglish' = 'en'
): Promise<{ title: string; body: string; category: string }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiKeyMissingError();
  }

  const ai = new GoogleGenAI({ apiKey });
  const langRule =
    language === 'hi'
      ? 'Write both "title" and "body" in natural, heartfelt Devanagari Hindi (हिंदी) in the first person ("मैं/मेरा").'
      : language === 'hinglish'
      ? 'Write in natural, heartfelt Hinglish (first-person "main/mera").'
      : 'Write in natural, heartfelt first-person English ("I/my").';

  const prompt = `You are helping an ordinary Indian citizen draft a public, anonymous post for "The Court of People" on Vakaalat (a supportive legal help community like Reddit).
RULES:
1. Preserve the user's REAL emotions, vulnerability, and exact facts—do NOT sound robotic or overly formal like a dry court affidavit.
2. NEVER include the user's real name, phone number, or exact bank/ID numbers. Keep it safe and anonymous.
3. Naturally weave in the context of the situation and briefly mention the relevant legal area (${category}) and key Dhaarein (${dharas.slice(0, 3).join(', ')}) so advocates and citizens know how to help.
4. End with a warm, clear ask for guidance from advocates and community members.
5. ${langRule}
6. Return ONLY valid JSON: { "title": "compelling human headline", "body": "3-5 clear sentences or 2 short paragraphs" }

User's raw story:
"""
${userStory}
"""`;

  let rawText = '';
  let lastErr: any = null;

  for (const modelName of [...new Set(GEMINI_MODEL_CHAIN)]) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });
      rawText = (response.text || '').trim();
      if (rawText) break;
    } catch (err: any) {
      lastErr = err;
      const status = err?.status || err?.code;
      if (status === 404 || status === 503 || status === 429) continue;
      throw err;
    }
  }

  if (!rawText) {
    throw lastErr || new Error('Could not draft post right now. Please try again.');
  }

  const parsed = DraftPostSchema.safeParse(JSON.parse(rawText));
  if (!parsed.success) {
    throw new Error('AI draft format was incomplete. Please try again.');
  }

  return {
    title: parsed.data.title,
    body: parsed.data.body,
    category,
  };
}
