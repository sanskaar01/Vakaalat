import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const EXPERIENCE_DIR = path.resolve(process.cwd(), 'experience');
const RAW_LOG_FILE = path.join(EXPERIENCE_DIR, 'raw_evaluations.jsonl');
const LEARNED_FILE = path.join(EXPERIENCE_DIR, 'learned_patterns.json');

export interface ExperienceRecord {
  timestamp: string;
  category: string;
  maskedQuery: string;
  dharasCited: string[];
  seriousnessLevel: string;
  portalsUsed: string[];
  youtubeTopics: string[];
}

export interface LearnedPatterns {
  lastUpdated: string;
  totalEvaluations: number;
  categoryCounts: Record<string, number>;
  topDharasByCategory: Record<string, string[]>;
  topPortalsByCategory: Record<string, string[]>;
}

function ensureExperienceDir(): void {
  fs.mkdirSync(EXPERIENCE_DIR, { recursive: true });
}

export function computePromptFingerprint(query: string, language: string): string {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
  return crypto.createHash('sha256').update(`${language}::${normalized}`).digest('hex').slice(0, 24);
}

/**
 * Appends an anonymized, PII-masked evaluation entry to `backend/experience/raw_evaluations.jsonl`
 * as a permanent, separate source of real-world learning.
 */
export function recordExperience(record: ExperienceRecord): void {
  ensureExperienceDir();
  fs.appendFileSync(RAW_LOG_FILE, JSON.stringify(record) + '\n', 'utf8');
}

/**
 * Reads `raw_evaluations.jsonl` and distills high-frequency Dhaarein and verified portals
 * per legal category into `learned_patterns.json` to sharpen future prompts while saving tokens.
 */
export function distillExperiencePatterns(): LearnedPatterns {
  ensureExperienceDir();
  const categoryCounts: Record<string, number> = {};
  const dharaFreq: Record<string, Record<string, number>> = {};
  const portalFreq: Record<string, Record<string, number>> = {};
  let totalEvaluations = 0;

  if (fs.existsSync(RAW_LOG_FILE)) {
    const lines = fs.readFileSync(RAW_LOG_FILE, 'utf8').split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as ExperienceRecord;
        totalEvaluations++;
        categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;

        dharaFreq[entry.category] ??= {};
        for (const d of entry.dharasCited || []) {
          dharaFreq[entry.category][d] = (dharaFreq[entry.category][d] || 0) + 1;
        }

        portalFreq[entry.category] ??= {};
        for (const p of entry.portalsUsed || []) {
          portalFreq[entry.category][p] = (portalFreq[entry.category][p] || 0) + 1;
        }
      } catch {
        // skip malformed lines
      }
    }
  }

  const topDharasByCategory: Record<string, string[]> = {};
  for (const [cat, map] of Object.entries(dharaFreq)) {
    topDharasByCategory[cat] = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);
  }

  const topPortalsByCategory: Record<string, string[]> = {};
  for (const [cat, map] of Object.entries(portalFreq)) {
    topPortalsByCategory[cat] = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([k]) => k);
  }

  const distilled: LearnedPatterns = {
    lastUpdated: new Date().toISOString(),
    totalEvaluations,
    categoryCounts,
    topDharasByCategory,
    topPortalsByCategory,
  };

  fs.writeFileSync(LEARNED_FILE, JSON.stringify(distilled, null, 2), 'utf8');
  return distilled;
}

export function getCompactLearnedHint(): string {
  try {
    if (!fs.existsSync(LEARNED_FILE)) return '';
    const data = JSON.parse(fs.readFileSync(LEARNED_FILE, 'utf8')) as LearnedPatterns;
    if (!data.totalEvaluations) return '';
    const topCats = Object.entries(data.categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => {
        const d = (data.topDharasByCategory[cat] || []).slice(0, 2).join('; ');
        return `${cat}: ${d}`;
      })
      .join(' | ');
    return topCats ? `Prior verified Indian patterns (${data.totalEvaluations} cases): ${topCats}` : '';
  } catch {
    return '';
  }
}
