import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/get-session', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    idea: {
      findFirst: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    pipelineRun: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/jobs/idea.rescore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/jobs/idea.rescore')>();
  return {
    ...actual,
    enqueueIdeaRescore: vi.fn().mockResolvedValue(undefined),
  };
});

import { requireAuth } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';
import { PATCH as patchNarrowing } from '@/app/api/ideas/[ideaId]/narrowing/route';
import { POST as postRescore } from '@/app/api/ideas/[ideaId]/rescore/route';
import { ideaRescoreJob } from '@/jobs/idea.rescore';
import { inngestFunctions } from '@/jobs';

const SYSTEM_TOPIC = '__system_feed__';

function narrowedIdeaRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'idea-1',
    researchId: 'sys-1',
    status: 'narrowed',
    primaryUser: 'solo',
    problem: 'problem',
    inputDataType: 'signals',
    mainAction: 'rank',
    concreteResult: 'shortlist',
    payReason: 'time',
    oneJobTemplate: 'For a solo who needs Y, tool does Z',
    oneJobScore: 90,
    aiBuildabilityScore: 80,
    firstSalePotential: 75,
    estimatedBuildDays: 16,
    opportunityScore: 70,
    buildTimeConfidence: 'medium',
    mainTechnicalRisk: 'LLM',
    requiredIntegrations: [],
    featuresExcludedToFitDeadline: [],
    riskOfDeveloperHelp: 'low',
    fourteenDayBuildPlan: [],
    firstCustomerPersona: 'indie',
    whereToFindCustomers: 'HN',
    painStatement: 'pain',
    shortOffer: 'offer',
    primaryAcquisitionChannel: 'HN',
    howToShowResult: 'cards',
    recommendedCta: 'go',
    simplePrice: '$19',
    howToGetFirstPayment: 'stripe',
    continueCriteria: 'continue',
    stopCriteria: 'stop',
    exclusionReasons: ['exceeds_14_days'],
    supportingSignalIds: [],
    supportingClusterIds: [],
    scoreBreakdown: null,
    createdAt: new Date('2026-07-30T10:00:00.000Z'),
    updatedAt: new Date('2026-07-30T11:00:00.000Z'),
    research: {
      id: 'sys-1',
      userId: 'owner-1',
      topic: SYSTEM_TOPIC,
    },
    ...overrides,
  };
}

describe('PATCH /api/ideas/[ideaId]/narrowing + POST rescore', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T1: PATCH valid narrowing returns 200 with updated days/features', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    } as never);

    const row = narrowedIdeaRow();
    vi.mocked(prisma.idea.findFirst).mockResolvedValue(row as never);
    vi.mocked(prisma.idea.update).mockResolvedValue({
      ...row,
      featuresExcludedToFitDeadline: ['SSO', 'BI'],
      estimatedBuildDays: 12,
    } as never);
    // getIdeaDetail uses findFirst again after update
    vi.mocked(prisma.idea.findFirst)
      .mockResolvedValueOnce(row as never)
      .mockResolvedValueOnce({
        ...row,
        featuresExcludedToFitDeadline: ['SSO', 'BI'],
        estimatedBuildDays: 12,
      } as never);

    const response = await patchNarrowing(
      new Request('http://localhost/api/ideas/idea-1/narrowing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featuresExcludedToFitDeadline: ['SSO', 'BI'],
        }),
      }),
      { params: Promise.resolve({ ideaId: 'idea-1' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.featuresExcludedToFitDeadline).toEqual(['SSO', 'BI']);
    expect(body.estimatedBuildDays).toBe(12);
    expect(prisma.idea.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          featuresExcludedToFitDeadline: ['SSO', 'BI'],
          estimatedBuildDays: 12,
        }),
      }),
    );
  });

  it('T4: rescore during active pipeline returns 409', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    } as never);

    const row = narrowedIdeaRow({
      estimatedBuildDays: 12,
      featuresExcludedToFitDeadline: ['SSO'],
    });
    vi.mocked(prisma.idea.findFirst).mockResolvedValue(row as never);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue({
      id: 'run-1',
    } as never);

    const response = await postRescore(
      new Request('http://localhost/api/ideas/idea-1/rescore', {
        method: 'POST',
      }),
      { params: Promise.resolve({ ideaId: 'idea-1' }) },
    );

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toMatch(/анализ/i);
  });

  it('T2+T3: POST rescore updates narrowed → recommended', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    } as never);

    const afterPatch = narrowedIdeaRow({
      estimatedBuildDays: 12,
      featuresExcludedToFitDeadline: ['SSO', 'BI'],
      exclusionReasons: ['exceeds_14_days'],
    });

    vi.mocked(prisma.idea.findFirst).mockResolvedValue(afterPatch as never);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.idea.findUniqueOrThrow).mockResolvedValue(
      afterPatch as never,
    );
    vi.mocked(prisma.idea.update).mockResolvedValue({
      ...afterPatch,
      status: 'recommended',
      exclusionReasons: [],
      opportunityScore: 82,
    } as never);
    // getIdeaDetail after rescore
    vi.mocked(prisma.idea.findFirst)
      .mockResolvedValueOnce(afterPatch as never)
      .mockResolvedValueOnce({
        ...afterPatch,
        status: 'recommended',
        exclusionReasons: [],
        opportunityScore: 82,
      } as never);

    const response = await postRescore(
      new Request('http://localhost/api/ideas/idea-1/rescore', {
        method: 'POST',
      }),
      { params: Promise.resolve({ ideaId: 'idea-1' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('recommended');
  });

  it('registers idea.rescore job in runner', () => {
    expect(inngestFunctions).toContain(ideaRescoreJob);
  });
});
