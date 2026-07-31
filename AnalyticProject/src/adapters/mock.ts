import type {
  AdapterFetchContext,
  AdapterSourceType,
  IngestSignal,
  SourceAdapter,
} from './types';

/** Deterministic fixtures for ADAPTER_MODE=mock and unit tests. */
export function createMockAdapter(
  sourceType: AdapterSourceType,
  count = 2,
): SourceAdapter {
  return {
    sourceType,
    async fetchSignals(ctx: AdapterFetchContext): Promise<IngestSignal[]> {
      const q = [ctx.topic, ...ctx.keywords].filter(Boolean).join(' ').trim();
      const capturedAt = new Date('2026-07-31T10:00:00.000Z');

      return Array.from({ length: count }, (_, i) => {
        const n = i + 1;
        return {
          sourceUrl: `https://mock.local/${sourceType}/${n}`,
          rawText: `[${sourceType}] Signal ${n} about ${q || 'saas'}`,
          authorHint: `mock-author-${n}`,
          capturedAt,
          metadata: { mock: true, index: n },
        };
      });
    },
  };
}
