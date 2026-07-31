import { enqueuePipelineRun } from '@/jobs/pipeline.run';
import { SCHEDULE_REFRESH_DAYS } from '@/lib/pipeline/constants';
import { prisma } from '@/lib/prisma';

export type ScheduleRefreshEnqueue = {
  researchId: string;
  pipelineRunId: string;
};

export type ScheduleRefreshSkip = {
  researchId: string;
  reason: 'active_run';
};

export type ScheduleRefreshResult = {
  enqueued: ScheduleRefreshEnqueue[];
  skipped: ScheduleRefreshSkip[];
};

/** Cutoff: last_pipeline_finished_at must be strictly older than this. */
export function scheduleRefreshCutoff(now: Date): Date {
  return new Date(
    now.getTime() - SCHEDULE_REFRESH_DAYS * 24 * 60 * 60 * 1000,
  );
}

/**
 * Edge (STEP F5-06): null last_pipeline_finished_at → skip (never ran).
 * Only researches that finished at least once and are ≥3 days old are due.
 */
export function isDueForScheduleRefresh(
  lastPipelineFinishedAt: Date | null,
  now: Date,
): boolean {
  if (lastPipelineFinishedAt === null) {
    return false;
  }
  return lastPipelineFinishedAt.getTime() < scheduleRefreshCutoff(now).getTime();
}

/**
 * Find due researches and enqueue pipeline.run with trigger=scheduled.
 * Skips active queued|running runs. Null lastPipelineFinishedAt excluded by query.
 */
export async function runScheduleRefresh(
  now: Date = new Date(),
): Promise<ScheduleRefreshResult> {
  const cutoff = scheduleRefreshCutoff(now);

  const candidates = await prisma.research.findMany({
    where: {
      autoRefreshEnabled: true,
      lastPipelineFinishedAt: { lt: cutoff, not: null },
    },
    select: { id: true },
  });

  const enqueued: ScheduleRefreshEnqueue[] = [];
  const skipped: ScheduleRefreshSkip[] = [];

  for (const research of candidates) {
    const activeRun = await prisma.pipelineRun.findFirst({
      where: {
        researchId: research.id,
        status: { in: ['queued', 'running'] },
      },
      select: { id: true },
    });

    if (activeRun) {
      skipped.push({ researchId: research.id, reason: 'active_run' });
      continue;
    }

    const run = await prisma.pipelineRun.create({
      data: {
        researchId: research.id,
        status: 'queued',
        trigger: 'scheduled',
      },
    });

    await enqueuePipelineRun({
      researchId: research.id,
      pipelineRunId: run.id,
      trigger: 'scheduled',
    });

    await prisma.research.update({
      where: { id: research.id },
      data: { status: 'running' },
    });

    enqueued.push({ researchId: research.id, pipelineRunId: run.id });
  }

  return { enqueued, skipped };
}
