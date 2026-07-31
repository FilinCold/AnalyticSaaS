import { PipelineStepError } from '@/domain/pipeline/errors';
import { ingestAdapterSignals } from '@/domain/signals/ingest';

import type { PipelineContext } from '../types';

/** ingest: scheduled|manual pull adapters; initial may skip. Then require ≥1 signal. */
export async function stepIngest(ctx: PipelineContext): Promise<void> {
  const { trigger, researchId, prisma } = ctx;

  if (ctx.ingestSignals) {
    await ctx.ingestSignals(researchId);
  } else if (trigger === 'scheduled' || trigger === 'manual') {
    const research = await prisma.research.findUniqueOrThrow({
      where: { id: researchId },
      select: { id: true, topic: true, keywords: true },
    });
    await ingestAdapterSignals(research);
  }

  const count = await prisma.signal.count({ where: { researchId } });
  if (count === 0) {
    throw new PipelineStepError(
      'Нет сигналов для анализа. Добавьте сигналы или обновите ленту.',
    );
  }
}
