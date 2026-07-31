import type { PipelineContext } from '../types';

export async function stepFinish(ctx: PipelineContext): Promise<void> {
  const now = new Date();

  // Drop prior-run ideas (kept recommended until success)
  if (ctx.candidateIdeaIds.length > 0) {
    await ctx.prisma.idea.deleteMany({
      where: {
        researchId: ctx.researchId,
        id: { notIn: ctx.candidateIdeaIds },
      },
    });
  }

  await ctx.prisma.research.update({
    where: { id: ctx.researchId },
    data: {
      status: 'ready',
      lastPipelineFinishedAt: now,
    },
  });

  await ctx.prisma.pipelineRun.update({
    where: { id: ctx.pipelineRunId },
    data: {
      status: 'succeeded',
      currentStep: 'finish',
      finishedAt: now,
      error: null,
    },
  });
}
