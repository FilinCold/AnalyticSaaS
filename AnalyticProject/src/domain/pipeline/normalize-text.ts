/** Deterministic signal text cleanup — SSOT: AI_PIPELINE normalize_signals */

const MAX_NORMALIZED_LENGTH = 50_000;

export function normalizeSignalText(raw: string): string {
  let text = raw.trim();
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  return text.slice(0, MAX_NORMALIZED_LENGTH);
}
