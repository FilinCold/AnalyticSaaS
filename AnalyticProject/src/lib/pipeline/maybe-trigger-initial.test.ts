import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    signal: {
      count: vi.fn(),
    },
    pipelineRun: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    research: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@/jobs/pipeline.run', () => ({
  enqueuePipelineRun: vi.fn().mockResolvedValue({ ids: ['evt-1'] }),
}));

const queuedInitial = {
  id: 'run-initial-1',
  researchId: 'r1',
  status: 'queued',
  trigger: 'initial',
  currentStep: null,
  error: null,
  createdAt: new Date('2026-07-31T12:00:00.000Z'),
  finishedAt: null,
};

describe('maybeTriggerInitialPipeline', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T1: first signal → initial run queued', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    const { maybeTriggerInitialPipeline } = await import(
      '@/lib/pipeline/maybe-trigger-initial'
    );

    vi.mocked(prisma.signal.count).mockResolvedValue(1);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.pipelineRun.create).mockResolvedValue(
      queuedInitial as never,
    );
    vi.mocked(prisma.research.update).mockResolvedValue({} as never);

    const runId = await maybeTriggerInitialPipeline('r1');

    expect(runId).toBe('run-initial-1');
    expect(prisma.pipelineRun.create).toHaveBeenCalledWith({
      data: {
        researchId: 'r1',
        status: 'queued',
        trigger: 'initial',
      },
    });
    expect(enqueuePipelineRun).toHaveBeenCalledWith({
      researchId: 'r1',
      pipelineRunId: 'run-initial-1',
      trigger: 'initial',
    });
    expect(prisma.research.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { status: 'running' },
    });
  });

  it('T2: zero signals → no run', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    const { maybeTriggerInitialPipeline } = await import(
      '@/lib/pipeline/maybe-trigger-initial'
    );

    vi.mocked(prisma.signal.count).mockResolvedValue(0);

    const runId = await maybeTriggerInitialPipeline('r1');

    expect(runId).toBeNull();
    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
    expect(enqueuePipelineRun).not.toHaveBeenCalled();
    expect(prisma.research.update).not.toHaveBeenCalled();
  });

  it('T3: second signal → no new initial', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    const { maybeTriggerInitialPipeline } = await import(
      '@/lib/pipeline/maybe-trigger-initial'
    );

    vi.mocked(prisma.signal.count).mockResolvedValue(2);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue({
      id: 'prior-initial',
    } as never);

    const runId = await maybeTriggerInitialPipeline('r1');

    expect(runId).toBeNull();
    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
    expect(enqueuePipelineRun).not.toHaveBeenCalled();
  });

  it('T4: prior initial exists → no duplicate', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    const { maybeTriggerInitialPipeline } = await import(
      '@/lib/pipeline/maybe-trigger-initial'
    );

    vi.mocked(prisma.signal.count).mockResolvedValue(5);
    // First findFirst: existing initial
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue({
      id: 'old-initial',
      trigger: 'initial',
      status: 'succeeded',
    } as never);

    const runId = await maybeTriggerInitialPipeline('r1');

    expect(runId).toBeNull();
    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
    expect(enqueuePipelineRun).not.toHaveBeenCalled();
  });

  it('skips when active run queued|running', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    const { maybeTriggerInitialPipeline } = await import(
      '@/lib/pipeline/maybe-trigger-initial'
    );

    vi.mocked(prisma.signal.count).mockResolvedValue(1);
    vi.mocked(prisma.pipelineRun.findFirst)
      .mockResolvedValueOnce(null) // no prior initial
      .mockResolvedValueOnce({ id: 'active', status: 'running' } as never);

    const runId = await maybeTriggerInitialPipeline('r1');

    expect(runId).toBeNull();
    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
    expect(enqueuePipelineRun).not.toHaveBeenCalled();
  });
});
