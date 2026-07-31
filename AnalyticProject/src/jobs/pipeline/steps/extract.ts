import { withLlmRetry } from '@/domain/pipeline/llm-retry';
import { PipelineStepError } from '@/domain/pipeline/errors';
import {
  extractPainsResultSchema,
  type ExtractPainsResult,
} from '@/lib/llm';
import { EXTRACT_PAINS_SYSTEM } from '@/lib/llm/prompts';

import type { PipelineContext } from '../types';

function remapPainsToSignals(
  pains: ExtractPainsResult['pains'],
  signalIds: string[],
): ExtractPainsResult['pains'] {
  if (signalIds.length === 0) return pains;
  return pains.map((pain, index) => ({
    ...pain,
    signalId: signalIds.includes(pain.signalId)
      ? pain.signalId
      : (signalIds[index] ?? signalIds[index % signalIds.length]!),
  }));
}

export async function stepExtract(
  ctx: PipelineContext,
): Promise<ExtractPainsResult> {
  const research = await ctx.prisma.research.findUniqueOrThrow({
    where: { id: ctx.researchId },
    select: { topic: true, keywords: true },
  });

  const signals = await ctx.prisma.signal.findMany({
    where: { researchId: ctx.researchId },
    select: { id: true, normalizedText: true, rawText: true },
    orderBy: { capturedAt: 'asc' },
  });

  const payload = signals.map((s) => ({
    signalId: s.id,
    normalizedText: s.normalizedText ?? s.rawText,
  }));

  const raw = await withLlmRetry(() =>
    ctx.llm.completeStructured({
      schema: extractPainsResultSchema,
      system: EXTRACT_PAINS_SYSTEM,
      user: JSON.stringify({
        topic: research.topic,
        keywords: research.keywords,
        signals: payload,
      }),
      fixture: 'extract-pains',
      schemaName: 'ExtractPainsResult',
    }),
  );

  const pains = remapPainsToSignals(
    raw.pains,
    signals.map((s) => s.id),
  );
  if (pains.length === 0) {
    throw new PipelineStepError('LLM не вернул боли (extract_pains пустой).');
  }

  return { pains };
}
