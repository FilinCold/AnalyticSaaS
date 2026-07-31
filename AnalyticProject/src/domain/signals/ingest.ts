import { getAdapters, AdapterConfigError } from '@/adapters';
import type { AdapterSourceType, IngestSignal, SourceAdapter } from '@/adapters';
import { maybeTriggerInitialPipeline } from '@/lib/pipeline/maybe-trigger-initial';
import { prisma } from '@/lib/prisma';
import { hashRawText } from '@/lib/signal/hash';
import type { Prisma } from '@prisma/client';

export type IngestError = {
  sourceType: AdapterSourceType;
  message: string;
};

export type IngestResult = {
  researchId: string;
  ingestedCount: number;
  bySource: Partial<Record<AdapterSourceType, number>>;
  errors: IngestError[];
};

type ResearchForIngest = {
  id: string;
  topic: string;
  keywords: string[];
};

function signalKey(signal: {
  sourceUrl?: string | null;
  rawText: string;
}): string {
  const url = signal.sourceUrl?.trim();
  if (url) return `url:${url}`;
  return `hash:${hashRawText(signal.rawText)}`;
}

async function loadExistingKeys(researchId: string): Promise<Set<string>> {
  const rows = await prisma.signal.findMany({
    where: { researchId },
    select: { sourceUrl: true, rawText: true },
  });
  return new Set(rows.map((row) => signalKey(row)));
}

async function insertNew(
  researchId: string,
  sourceType: AdapterSourceType,
  candidates: IngestSignal[],
  existing: Set<string>,
): Promise<number> {
  let inserted = 0;

  for (const signal of candidates) {
    const key = signalKey(signal);
    if (existing.has(key)) continue;

    const metadata: Prisma.InputJsonValue = {
      ...(signal.metadata ?? {}),
      contentHash: hashRawText(signal.rawText),
    };

    await prisma.signal.create({
      data: {
        researchId,
        sourceType,
        sourceUrl: signal.sourceUrl?.trim() || null,
        rawText: signal.rawText.slice(0, 50_000),
        authorHint: signal.authorHint?.trim() || null,
        capturedAt: signal.capturedAt,
        metadata,
      },
    });

    existing.add(key);
    inserted += 1;
  }

  return inserted;
}

export type IngestOptions = {
  adapters?: SourceAdapter[];
};

/**
 * Fetch from adapters, dedup by sourceUrl or rawText hash, insert Signal rows.
 * Continues other adapters if one fails (config or network).
 */
export async function ingestAdapterSignals(
  research: ResearchForIngest,
  options: IngestOptions = {},
): Promise<IngestResult> {
  const adapters = options.adapters ?? getAdapters();
  const existing = await loadExistingKeys(research.id);
  const bySource: Partial<Record<AdapterSourceType, number>> = {};
  const errors: IngestError[] = [];
  let ingestedCount = 0;

  const ctx = {
    topic: research.topic,
    keywords: research.keywords,
  };

  for (const adapter of adapters) {
    try {
      const fetched = await adapter.fetchSignals(ctx);
      const count = await insertNew(
        research.id,
        adapter.sourceType,
        fetched,
        existing,
      );
      bySource[adapter.sourceType] = count;
      ingestedCount += count;
    } catch (err) {
      const message =
        err instanceof AdapterConfigError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Неизвестная ошибка адаптера';
      errors.push({ sourceType: adapter.sourceType, message });
      bySource[adapter.sourceType] = 0;
    }
  }

  if (ingestedCount > 0) {
    await maybeTriggerInitialPipeline(research.id);
  }

  return {
    researchId: research.id,
    ingestedCount,
    bySource,
    errors,
  };
}
