# Vakaalat Self-Learning Experience Folder

This folder collects anonymized, PII-masked real-world legal evaluations so Vakaalat can continuously improve accuracy while minimizing Gemini token usage.

## Files
- `raw_evaluations.jsonl` — Append-only log of masked queries, cited Indian Dhaarein, seriousness levels, portals, and YouTube topics (zero real names or private phone/PAN numbers).
- `learned_patterns.json` — Distilled high-frequency Dhaarein & verified portals per legal category, automatically refreshed when you trigger **Revisit Experience** (`POST /api/v1/jolly/revisit-experience`).

## How Token Minimization Works (Zero Quality Loss)
1. **Prompt Fingerprint Cache:** Exact repeat queries or users reopening saved history return the stored 4-pillar JSON in `<5ms` with **0 Gemini tokens**.
2. **Distilled Pattern Injection:** Instead of inflating prompts with repetitive examples, `jollyEngine.ts` injects only a compact 1-line learned pattern hint from `learned_patterns.json`.
