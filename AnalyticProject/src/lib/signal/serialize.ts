import type { Prisma } from '@prisma/client';

export type SignalRecord = {
  id: string;
  sourceType: string;
  sourceUrl: string | null;
  rawText: string;
  normalizedText: string | null;
  authorHint: string | null;
  capturedAt: Date;
  metadata: Prisma.JsonValue;
};

/** API.md § Signals response shape. */
export function toSignalResponse(row: SignalRecord) {
  return {
    id: row.id,
    sourceType: row.sourceType,
    sourceUrl: row.sourceUrl,
    rawText: row.rawText,
    normalizedText: row.normalizedText,
    authorHint: row.authorHint,
    capturedAt: row.capturedAt.toISOString(),
    metadata:
      row.metadata &&
      typeof row.metadata === 'object' &&
      !Array.isArray(row.metadata)
        ? row.metadata
        : {},
  };
}
