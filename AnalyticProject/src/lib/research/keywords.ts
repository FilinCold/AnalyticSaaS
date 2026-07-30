/** Comma-separated keywords field → trimmed non-empty array. */
export function parseKeywords(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}
