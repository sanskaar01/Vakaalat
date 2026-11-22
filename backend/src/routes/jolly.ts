import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../db/database.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import {
  computePromptFingerprint,
  distillExperiencePatterns,
  recordExperience,
} from '../services/experienceStore.js';
import {
  ACTIVE_GEMINI_MODEL,
  draftCourtOfPeoplePost,
  GeminiKeyMissingError,
  isGeminiConfigured,
  runJollyAssistant,
} from '../services/jollyEngine.js';

export const jollyRouter = Router();

const chatSchema = z.object({
  query: z.string().min(8, 'Please describe what happened in a few words so we can examine it properly.'),
  language: z.enum(['en', 'hinglish']).default('en'),
});

const draftSchema = z.object({
  userStory: z.string().min(8),
  category: z.string().min(2),
  dharas: z.array(z.string()).default([]),
  language: z.enum(['en', 'hinglish']).default('en'),
});

jollyRouter.get('/status', (_req, res) => {
  res.json({
    geminiConfigured: isGeminiConfigured(),
    model: ACTIVE_GEMINI_MODEL,
  });
});

jollyRouter.get('/history', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT id, user_query, detected_category, full_response_json, created_at
       FROM jolly_sessions
       WHERE user_id = ? AND full_response_json IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 30`
    )
    .all(req.user!.id) as any[];

  res.json({
    history: rows.map((r) => ({
      id: r.id,
      query: r.user_query,
      category: r.detected_category,
      createdAt: r.created_at,
      analysis: JSON.parse(r.full_response_json),
    })),
  });
});

jollyRouter.post('/revisit-experience', (_req, res) => {
  const summary = distillExperiencePatterns();
  res.json({ ok: true, summary });
});

jollyRouter.post('/draft-post', optionalAuth, async (req, res) => {
  const parsed = draftSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Story and category are required to draft a post.' });
    return;
  }

  try {
    const draft = await draftCourtOfPeoplePost(
      parsed.data.userStory,
      parsed.data.category,
      parsed.data.dharas,
      parsed.data.language
    );
    res.json(draft);
  } catch (err: any) {
    if (err instanceof GeminiKeyMissingError) {
      res.status(503).json({ errorCode: 'GEMINI_KEY_REQUIRED', error: err.message });
      return;
    }
    res.status(502).json({ error: err?.message || 'Failed to draft post with Gemini.' });
  }
});

jollyRouter.post('/chat', optionalAuth, async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid query' });
    return;
  }

  let realName: string | undefined;
  if (req.user) {
    const u = db.prepare('SELECT real_name FROM users WHERE id = ?').get(req.user.id) as any;
    realName = u?.real_name;
  }

  const fingerprint = computePromptFingerprint(parsed.data.query, parsed.data.language);

  try {
    // Always compute live & accurately via Gemini
    const result = await runJollyAssistant(parsed.data.query, parsed.data.language, realName);
    const serialized = JSON.stringify(result);

    db.prepare(
      `INSERT INTO jolly_sessions (id, user_id, user_query, detected_category, jolly_reply, first_aid_steps, gov_portals, full_response_json, prompt_fingerprint)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      randomUUID(),
      req.user?.id || null,
      parsed.data.query,
      result.detectedCategory,
      result.pillar1_violations.compassionateValidation,
      JSON.stringify(result.pillar4_digitalFirstAid.immediateSteps),
      JSON.stringify(result.pillar4_digitalFirstAid.govPortals),
      serialized,
      fingerprint
    );

    recordExperience({
      timestamp: new Date().toISOString(),
      category: result.detectedCategory,
      maskedQuery: result.draftPostMasked,
      dharasCited: result.pillar1_violations.violations.map((v) => v.code),
      seriousnessLevel: result.pillar3_seriousness.level,
      portalsUsed: result.pillar4_digitalFirstAid.govPortals.map((p) => p.name),
      youtubeTopics: result.youtubeGuidesWithUrls.map((y) => y.title),
    });

    res.json(result);
  } catch (err: any) {
    if (err instanceof GeminiKeyMissingError) {
      res.status(503).json({
        errorCode: 'GEMINI_KEY_REQUIRED',
        error: err.message,
      });
      return;
    }
    console.error('[Gemini Engine Error]', err);
    res.status(502).json({
      errorCode: 'GEMINI_EXECUTION_ERROR',
      error: err?.message || 'Unable to compute legal analysis right now. Please try again.',
    });
  }
});
