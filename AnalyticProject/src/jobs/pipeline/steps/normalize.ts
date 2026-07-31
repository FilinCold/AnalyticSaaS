import { normalizeSignalText } from '@/domain/pipeline/normalize-text';

import type { PipelineContext } from '../types';

export async function stepNormalize(ctx: PipelineContext): Promise<void> {
  const signals = await ctx.prisma.signal.findMany({
    where: { researchId: ctx.researchId },
    select: { id: true, rawText: true },
  });

  for (const signal of signals) {
    const normalizedText = normalizeSignalText(signal.rawText);
    await ctx.prisma.signal.update({
      where: { id: signal.id },
      data: { normalizedText },
    });
  }
}
