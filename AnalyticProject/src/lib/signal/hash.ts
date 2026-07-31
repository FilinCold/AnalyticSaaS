import { createHash } from 'node:crypto';

/** Stable fingerprint for dedup when sourceUrl is missing. */
export function hashRawText(rawText: string): string {
  return createHash('sha256').update(rawText).digest('hex');
}
