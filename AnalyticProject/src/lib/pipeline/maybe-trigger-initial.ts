import { enqueuePipelineRun } from '@/jobs/pipeline.run';
import { prisma } from '@/lib/prisma';

/**
 * Auto-enqueue first pipeline.run (trigger=initial) when research has ≥1 signal
 * and no prior initial run / active run exists.
 * @returns pipelineRun id when queued, else null
 */
export async function maybeTriggerInitialPipeline(
  researchId: string,
): Promise<string | null> {
  const signalCount = await prisma.signal.count({
    where: { researchId },
  });
  if (signalCount < 1) {
    return null;
  }

  const priorInitial = await prisma.pipelineRun.findFirst({
    where: { researchId, trigger: 'initial' },
    select: { id: true },
  });
  if (priorInitial) {
    return null;
  }

  const activeRun = await prisma.pipelineRun.findFirst({
    where: {
      researchId,
      status: { in: ['queued', 'running'] },
    },
    select: { id: true },
  });
  if (activeRun) {
    return null;
  }

  const run = await prisma.pipelineRun.create({
    data: {
      researchId,
      status: 'queued',
      trigger: 'initial',
    },
  });

  await enqueuePipelineRun({
    researchId,
    pipelineRunId: run.id,
    trigger: 'initial',
  });

  await prisma.research.update({
    where: { id: researchId },
    data: { status: 'running' },
  });

  return run.id;
}
