import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { MockLlmProvider } from '@/lib/llm';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

const FIXTURE_SIGNAL_IDS = [
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000003',
] as const;

describe.skipIf(!hasDatabaseUrl)('pipeline.run', () => {
  let userId: string;
  let researchId: string;
  let prisma: typeof import('@/lib/prisma').prisma;
  let executePipelineRun: typeof import('@/jobs/pipeline.run').executePipelineRun;

  beforeAll(async () => {
    ({ prisma } = await import('@/lib/prisma'));
    ({ executePipelineRun } = await import('@/jobs/pipeline.run'));

    userId = randomUUID();
    await prisma.user.create({
      data: {
        id: userId,
        email: `pipeline-run-${userId.slice(0, 8)}@test.local`,
        passwordHash: 'test-hash-not-used',
      },
    });

    const research = await prisma.research.create({
      data: {
        userId,
        title: 'F5-03 fixture research',
        topic: 'micro-SaaS idea discovery',
        keywords: ['saas', 'indie'],
        status: 'draft',
      },
    });
    researchId = research.id;
  });

  afterAll(async () => {
    if (!prisma || !userId) return;
    await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  async function resetResearchArtifacts() {
    await prisma.idea.deleteMany({ where: { researchId } });
    await prisma.painCluster.deleteMany({ where: { researchId } });
    await prisma.pipelineRun.deleteMany({ where: { researchId } });
    await prisma.signal.deleteMany({ where: { researchId } });
    await prisma.research.update({
      where: { id: researchId },
      data: { status: 'draft', lastPipelineFinishedAt: null },
    });
  }

  async function seedFixtureSignals(count = 3) {
    const texts = [
      'I spend weekends reading Show HN and still pick the wrong idea.',
      'I need to know if I can ship and sell a slice in 14 days.',
      'Forum scrolling without a commercial filter wastes my build weeks.',
    ];
    for (let i = 0; i < count; i += 1) {
      await prisma.signal.create({
        data: {
          id: FIXTURE_SIGNAL_IDS[i],
          researchId,
          sourceType: 'manual',
          rawText: texts[i]!,
          capturedAt: new Date(),
        },
      });
    }
  }

  it('queued → running on start; failed step sets status=failed', async () => {
    await resetResearchArtifacts();
    const run = await prisma.pipelineRun.create({
      data: {
        researchId,
        trigger: 'initial',
        status: 'queued',
      },
    });

    await executePipelineRun(
      {
        researchId,
        pipelineRunId: run.id,
        trigger: 'initial',
      },
      {
        llm: new MockLlmProvider(),
        /** Force fail at normalize by skipping signal seed */
      },
    );

    const failed = await prisma.pipelineRun.findUniqueOrThrow({
      where: { id: run.id },
    });
    expect(failed.status).toBe('failed');
    expect(failed.error).toBeTruthy();
    expect(failed.error).not.toMatch(/at\s+\S+\s+\(/);
    expect(failed.finishedAt).toBeTruthy();
  });

  it('T1/T4/T5/T6/T7: 3 fixture signals + mock LLM → succeeded with idea', async () => {
    await resetResearchArtifacts();
    await seedFixtureSignals(3);

    const run = await prisma.pipelineRun.create({
      data: {
        researchId,
        trigger: 'initial',
        status: 'queued',
      },
    });

    await executePipelineRun(
      {
        researchId,
        pipelineRunId: run.id,
        trigger: 'initial',
      },
      { llm: new MockLlmProvider() },
    );

    const finished = await prisma.pipelineRun.findUniqueOrThrow({
      where: { id: run.id },
    });
    expect(finished.status).toBe('succeeded');
    expect(finished.currentStep).toBe('finish');
    expect(finished.finishedAt).toBeTruthy();
    expect(finished.error).toBeNull();

    const signals = await prisma.signal.findMany({ where: { researchId } });
    expect(signals.every((s) => (s.normalizedText?.length ?? 0) > 0)).toBe(
      true,
    );

    const clusters = await prisma.painCluster.findMany({
      where: { researchId },
    });
    expect(clusters.length).toBeGreaterThanOrEqual(1);

    const ideas = await prisma.idea.findMany({ where: { researchId } });
    expect(ideas.length).toBeGreaterThanOrEqual(1);
    const idea = ideas[0]!;
    expect(idea.oneJobTemplate).toBeTruthy();
    expect(idea.scoreBreakdown).toBeTruthy();
    expect(idea.scoreBreakdown).not.toEqual({});
    expect(['recommended', 'narrowed', 'excluded', 'candidate']).toContain(
      idea.status,
    );
    expect(idea.status).not.toBe('candidate');

    const research = await prisma.research.findUniqueOrThrow({
      where: { id: researchId },
    });
    expect(research.status).toBe('ready');
    expect(research.lastPipelineFinishedAt).toBeTruthy();
  });

  it('T2: 0 signals → failed with clear error', async () => {
    await resetResearchArtifacts();
    const run = await prisma.pipelineRun.create({
      data: {
        researchId,
        trigger: 'initial',
        status: 'queued',
      },
    });

    await executePipelineRun(
      {
        researchId,
        pipelineRunId: run.id,
        trigger: 'initial',
      },
      { llm: new MockLlmProvider() },
    );

    const failed = await prisma.pipelineRun.findUniqueOrThrow({
      where: { id: run.id },
    });
    expect(failed.status).toBe('failed');
    expect(failed.error?.toLowerCase()).toMatch(/сигнал/);
  });
});
