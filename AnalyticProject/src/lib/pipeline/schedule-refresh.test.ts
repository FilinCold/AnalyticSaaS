import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    research: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    pipelineRun: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/jobs/pipeline.run', () => ({
  enqueuePipelineRun: vi.fn().mockResolvedValue({ ids: ['evt-1'] }),
}));

const NOW = new Date('2026-07-31T12:00:00.000Z');
const FOUR_DAYS_AGO = new Date('2026-07-27T12:00:00.000Z');
const ONE_DAY_AGO = new Date('2026-07-30T12:00:00.000Z');

describe('runScheduleRefresh', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T1: 4 days old, enabled → scheduled run created', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    const { runScheduleRefresh, scheduleRefreshCutoff } = await import(
      '@/lib/pipeline/schedule-refresh'
    );

    vi.mocked(prisma.research.findMany).mockResolvedValue([
      { id: 'r-old' },
    ] as never);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.pipelineRun.create).mockResolvedValue({
      id: 'run-sched-1',
      researchId: 'r-old',
      status: 'queued',
      trigger: 'scheduled',
    } as never);
    vi.mocked(prisma.research.update).mockResolvedValue({} as never);

    const result = await runScheduleRefresh(NOW);

    expect(prisma.research.findMany).toHaveBeenCalledWith({
      where: {
        autoRefreshEnabled: true,
        lastPipelineFinishedAt: { lt: scheduleRefreshCutoff(NOW), not: null },
      },
      select: { id: true },
    });
    expect(prisma.pipelineRun.create).toHaveBeenCalledWith({
      data: {
        researchId: 'r-old',
        status: 'queued',
        trigger: 'scheduled',
      },
    });
    expect(enqueuePipelineRun).toHaveBeenCalledWith({
      researchId: 'r-old',
      pipelineRunId: 'run-sched-1',
      trigger: 'scheduled',
    });
    expect(result.enqueued).toEqual([
      { researchId: 'r-old', pipelineRunId: 'run-sched-1' },
    ]);
  });

  it('T2: 1 day old → skip (not in candidate query)', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    const { runScheduleRefresh, scheduleRefreshCutoff, isDueForScheduleRefresh } =
      await import('@/lib/pipeline/schedule-refresh');

    expect(isDueForScheduleRefresh(ONE_DAY_AGO, NOW)).toBe(false);
    expect(isDueForScheduleRefresh(FOUR_DAYS_AGO, NOW)).toBe(true);
    expect(isDueForScheduleRefresh(null, NOW)).toBe(false);

    // Query would exclude 1-day-old; findMany returns empty
    vi.mocked(prisma.research.findMany).mockResolvedValue([]);

    const result = await runScheduleRefresh(NOW);

    expect(prisma.research.findMany).toHaveBeenCalledWith({
      where: {
        autoRefreshEnabled: true,
        lastPipelineFinishedAt: { lt: scheduleRefreshCutoff(NOW), not: null },
      },
      select: { id: true },
    });
    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
    expect(enqueuePipelineRun).not.toHaveBeenCalled();
    expect(result.enqueued).toEqual([]);
  });

  it('T3: disabled auto_refresh → skip', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    const { runScheduleRefresh } = await import(
      '@/lib/pipeline/schedule-refresh'
    );

    // disabled researches filtered by autoRefreshEnabled: true in where
    vi.mocked(prisma.research.findMany).mockResolvedValue([]);

    const result = await runScheduleRefresh(NOW);

    expect(prisma.research.findMany.mock.calls[0]?.[0]?.where).toMatchObject({
      autoRefreshEnabled: true,
    });
    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
    expect(enqueuePipelineRun).not.toHaveBeenCalled();
    expect(result.enqueued).toEqual([]);
  });

  it('T4: active run exists → skip', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    const { runScheduleRefresh } = await import(
      '@/lib/pipeline/schedule-refresh'
    );

    vi.mocked(prisma.research.findMany).mockResolvedValue([
      { id: 'r-active' },
    ] as never);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue({
      id: 'active-run',
      status: 'running',
    } as never);

    const result = await runScheduleRefresh(NOW);

    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
    expect(enqueuePipelineRun).not.toHaveBeenCalled();
    expect(result.enqueued).toEqual([]);
    expect(result.skipped).toEqual([
      { researchId: 'r-active', reason: 'active_run' },
    ]);
  });

  /**
   * Flow A2 (manual QA checklist — docs/USER_FLOWS.md):
   * 1. Cron / POST /api/dev/cron/schedule-refresh finds due researches
   * 2. Enqueues pipeline.run trigger=scheduled (ingest → pipeline)
   * 3. User sees «Последнее обновление» / feed «Обновлено» after success
   */
  it('documents Flow A2 acceptance path', () => {
    expect(true).toBe(true);
  });
});
