import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';

import {
  IDEA_DB_STATUSES,
  PIPELINE_RUN_STATUSES,
  PIPELINE_TRIGGERS,
} from '@/domain/types';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

describe('pipeline domain types', () => {
  it('exposes Idea / PipelineRun status and trigger unions', () => {
    expect(IDEA_DB_STATUSES).toEqual([
      'candidate',
      'recommended',
      'narrowed',
      'excluded',
    ]);
    expect(PIPELINE_RUN_STATUSES).toEqual([
      'queued',
      'running',
      'succeeded',
      'failed',
    ]);
    expect(PIPELINE_TRIGGERS).toEqual(['initial', 'manual', 'scheduled']);
  });
});

describe.skipIf(!hasDatabaseUrl)('pipeline models (DB)', () => {
  let researchId: string;
  let userId: string;
  let prisma: typeof import('@/lib/prisma').prisma;

  beforeAll(async () => {
    ({ prisma } = await import('@/lib/prisma'));

    userId = randomUUID();
    const email = `pipeline-models-${userId.slice(0, 8)}@test.local`;
    await prisma.user.create({
      data: {
        id: userId,
        email,
        passwordHash: 'test-hash-not-used',
      },
    });

    const research = await prisma.research.create({
      data: {
        userId,
        title: 'F5-01 fixture',
        topic: 'pipeline models',
        keywords: [],
      },
    });
    researchId = research.id;
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it('T2: create PipelineRun with research FK', async () => {
    const run = await prisma.pipelineRun.create({
      data: {
        researchId,
        trigger: 'manual',
        status: 'queued',
        currentStep: null,
      },
    });

    expect(run.id).toBeTruthy();
    expect(run.researchId).toBe(researchId);
    expect(run.trigger).toBe('manual');
    expect(run.status).toBe('queued');

    await prisma.pipelineRun.delete({ where: { id: run.id } });
  });

  it('T3: Idea jsonb fields accept arrays', async () => {
    const signalIds = [randomUUID(), randomUUID()];
    const clusterIds = [randomUUID()];

    const idea = await prisma.idea.create({
      data: {
        researchId,
        status: 'candidate',
        requiredIntegrations: ['stripe', 'openai'],
        featuresExcludedToFitDeadline: ['admin panel'],
        exclusionReasons: ['below_one_job'],
        supportingSignalIds: signalIds,
        supportingClusterIds: clusterIds,
        fourteenDayBuildPlan: [{ day: 1, tasks: ['scaffold'] }],
        scoreBreakdown: { oneJob: { explainableInOneSentence: 100 } },
      },
    });

    expect(idea.requiredIntegrations).toEqual(['stripe', 'openai']);
    expect(idea.supportingSignalIds).toEqual(signalIds);
    expect(idea.supportingClusterIds).toEqual(clusterIds);
    expect(idea.fourteenDayBuildPlan).toEqual([
      { day: 1, tasks: ['scaffold'] },
    ]);

    const cluster = await prisma.painCluster.create({
      data: {
        researchId,
        label: 'billing pain',
        summary: 'Users struggle with invoices',
        frequencyHint: 'high',
        signalIds,
      },
    });
    expect(cluster.signalIds).toEqual(signalIds);

    await prisma.idea.delete({ where: { id: idea.id } });
    await prisma.painCluster.delete({ where: { id: cluster.id } });
  });
});
