import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    signal: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/pipeline/maybe-trigger-initial', () => ({
  maybeTriggerInitialPipeline: vi.fn().mockResolvedValue(undefined),
}));

import { createMockAdapter } from '@/adapters/mock';
import { AdapterConfigError } from '@/adapters/types';
import { ingestAdapterSignals } from '@/domain/signals/ingest';
import { maybeTriggerInitialPipeline } from '@/lib/pipeline/maybe-trigger-initial';
import { prisma } from '@/lib/prisma';
import type { SourceAdapter } from '@/adapters';

const research = {
  id: 'sys-1',
  topic: '__system_feed__',
  keywords: ['saas'],
};

describe('ingestAdapterSignals', () => {
  beforeEach(() => {
    process.env.ADAPTER_MODE = 'mock';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T1: mock ingest inserts N signals with correct sourceType', async () => {
    vi.mocked(prisma.signal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.signal.create).mockImplementation(async ({ data }) => {
      return { id: `s-${data.sourceType}`, ...data } as never;
    });

    const adapters = [
      createMockAdapter('hackernews', 2),
      createMockAdapter('producthunt', 1),
    ];

    const result = await ingestAdapterSignals(research, { adapters });

    expect(result.ingestedCount).toBe(3);
    expect(result.bySource).toEqual({ hackernews: 2, producthunt: 1 });
    expect(result.errors).toEqual([]);
    expect(prisma.signal.create).toHaveBeenCalledTimes(3);
    expect(prisma.signal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          researchId: 'sys-1',
          sourceType: 'hackernews',
        }),
      }),
    );
    expect(maybeTriggerInitialPipeline).toHaveBeenCalledWith('sys-1');
  });

  it('T2: re-ingest yields 0 new (dedup by sourceUrl)', async () => {
    const adapter = createMockAdapter('hackernews', 2);
    const firstBatch = await adapter.fetchSignals({
      topic: research.topic,
      keywords: research.keywords,
    });

    vi.mocked(prisma.signal.findMany).mockResolvedValue(
      firstBatch.map((s) => ({
        sourceUrl: s.sourceUrl ?? null,
        rawText: s.rawText,
      })) as never,
    );

    const result = await ingestAdapterSignals(research, {
      adapters: [adapter],
    });

    expect(result.ingestedCount).toBe(0);
    expect(result.bySource).toEqual({ hackernews: 0 });
    expect(prisma.signal.create).not.toHaveBeenCalled();
    expect(maybeTriggerInitialPipeline).not.toHaveBeenCalled();
  });

  it('T4: live adapter without API key → graceful error, others continue', async () => {
    vi.mocked(prisma.signal.findMany).mockResolvedValue([]);
    vi.mocked(prisma.signal.create).mockImplementation(async ({ data }) => {
      return { id: 's1', ...data } as never;
    });

    const broken: SourceAdapter = {
      sourceType: 'producthunt',
      async fetchSignals() {
        throw new AdapterConfigError(
          'producthunt',
          'Product Hunt: задайте PRODUCTHUNT_API_TOKEN в env',
        );
      },
    };

    const result = await ingestAdapterSignals(research, {
      adapters: [createMockAdapter('hackernews', 1), broken],
    });

    expect(result.ingestedCount).toBe(1);
    expect(result.bySource).toEqual({ hackernews: 1, producthunt: 0 });
    expect(result.errors).toEqual([
      {
        sourceType: 'producthunt',
        message: 'Product Hunt: задайте PRODUCTHUNT_API_TOKEN в env',
      },
    ]);
  });
});
