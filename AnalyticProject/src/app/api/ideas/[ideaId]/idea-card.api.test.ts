import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/get-session', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    idea: {
      findFirst: vi.fn(),
    },
  },
}));

import { requireAuth } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';

/** IDEA_CARD_SPEC §§2–5 — must be non-null for recommended fixture. */
const REQUIRED_DETAIL_KEYS = [
  // §2 One Job
  'oneJobTemplate',
  'primaryUser',
  'problem',
  'inputDataType',
  'mainAction',
  'concreteResult',
  'payReason',
  // §3 Scores
  'oneJobScore',
  'aiBuildabilityScore',
  'firstSalePotential',
  'estimatedBuildDays',
  'opportunityScore',
  // §4 Build
  'buildTimeConfidence',
  'mainTechnicalRisk',
  'requiredIntegrations',
  'featuresExcludedToFitDeadline',
  'riskOfDeveloperHelp',
  'fourteenDayBuildPlan',
  // §5 Sales
  'firstCustomerPersona',
  'whereToFindCustomers',
  'painStatement',
  'shortOffer',
  'primaryAcquisitionChannel',
  'howToShowResult',
  'recommendedCta',
  'simplePrice',
  'howToGetFirstPayment',
  'continueCriteria',
  'stopCriteria',
] as const;

function recommendedIdeaFixture(
  overrides: Record<string, unknown> = {},
) {
  return {
    id: 'idea-rec-1',
    researchId: 'sys-1',
    status: 'recommended',
    primaryUser: 'solo indie hacker',
    problem: 'choosing a commercially testable micro-SaaS idea',
    inputDataType: 'public forum signals',
    mainAction: 'rank ideas by one-job + 14-day build fit',
    concreteResult: 'a shortlist of recommended idea cards',
    payReason: 'saves weeks of manual research before building',
    oneJobTemplate:
      'For a solo indie hacker who needs a commercially testable micro-SaaS idea, AnalyticSaaS takes public forum signals and ranks ideas by one-job fit and 14-day buildability so they get a shortlist of recommended cards they can start selling.',
    oneJobScore: 92,
    aiBuildabilityScore: 88,
    firstSalePotential: 80,
    estimatedBuildDays: 10,
    opportunityScore: 87,
    buildTimeConfidence: 'high',
    mainTechnicalRisk: 'LLM output quality variance on noisy forum text',
    requiredIntegrations: ['openai-compatible LLM', 'postgres'],
    featuresExcludedToFitDeadline: [],
    riskOfDeveloperHelp: 'low',
    fourteenDayBuildPlan: [
      { day: 1, tasks: ['scaffold ingest + normalize'] },
      { day: 3, tasks: ['wire extract/cluster LLM steps'] },
      { day: 5, tasks: ['draft ideas + estimate build'] },
      { day: 8, tasks: ['score + filter + persist'] },
      { day: 10, tasks: ['ideas feed read path'] },
    ],
    firstCustomerPersona: 'Solo indie hacker with an AI coding agent',
    whereToFindCustomers:
      'Indie Hackers, HN Show, Twitter/X indie hacker circles',
    painStatement: 'Weeks lost scanning forums without a commercial filter',
    shortOffer:
      'Rank micro-SaaS ideas by one-job fit and 14-day buildability',
    primaryAcquisitionChannel: 'Indie Hackers + HN',
    howToShowResult: 'Show 3 recommended idea cards from their feed',
    recommendedCta: 'Refresh feed and open top idea',
    simplePrice: '$19/mo',
    howToGetFirstPayment:
      'Stripe checkout after first recommended shortlist',
    continueCriteria:
      'At least one user starts building a recommended idea within 14 days',
    stopCriteria: 'No paid conversion after 30 days of active users',
    exclusionReasons: [],
    supportingSignalIds: ['sig-1'],
    supportingClusterIds: ['cluster-recommended-1'],
    scoreBreakdown: { oneJob: { singlePrimaryUser: 100 } },
    createdAt: new Date('2026-07-30T10:00:00.000Z'),
    updatedAt: new Date('2026-07-30T11:00:00.000Z'),
    research: {
      id: 'sys-1',
      userId: 'owner-1',
      topic: '__system_feed__',
    },
    ...overrides,
  };
}

describe('GET /api/ideas/[ideaId] idea-card', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('anonymous returns 401', async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      Response.json({ error: 'Не авторизован' }, { status: 401 }),
    );

    const { GET } = await import('@/app/api/ideas/[ideaId]/route');
    const response = await GET(new Request('http://localhost/api/ideas/x'), {
      params: Promise.resolve({ ideaId: 'x' }),
    });

    expect(response.status).toBe(401);
  });

  it('T1+T2: recommended fixture — all IDEA_CARD_SPEC §§2–5 keys present and non-null', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.idea.findFirst).mockResolvedValue(
      recommendedIdeaFixture() as never,
    );

    const { GET } = await import('@/app/api/ideas/[ideaId]/route');
    const response = await GET(
      new Request('http://localhost/api/ideas/idea-rec-1'),
      { params: Promise.resolve({ ideaId: 'idea-rec-1' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe('idea-rec-1');
    expect(body.status).toBe('recommended');

    for (const key of REQUIRED_DETAIL_KEYS) {
      expect(body[key], `missing or null: ${key}`).not.toBeNull();
      expect(body[key], `missing or undefined: ${key}`).not.toBeUndefined();
    }

    expect(body.fourteenDayBuildPlan).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          day: 1,
          tasks: expect.arrayContaining(['scaffold ingest + normalize']),
        }),
      ]),
    );
    expect(body.continueCriteria).toContain('14 days');
    expect(body.stopCriteria).toContain('30 days');
    expect(body.supportingSignalIds).toEqual(['sig-1']);
    expect(body.supportingClusterIds).toEqual(['cluster-recommended-1']);
    expect(body.scoreBreakdown).toEqual({
      oneJob: { singlePrimaryUser: 100 },
    });
  });

  it('missing idea returns 404', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.idea.findFirst).mockResolvedValue(null);

    const { GET } = await import('@/app/api/ideas/[ideaId]/route');
    const response = await GET(
      new Request('http://localhost/api/ideas/missing'),
      { params: Promise.resolve({ ideaId: 'missing' }) },
    );

    expect(response.status).toBe(404);
  });

  it('foreign non-system research idea returns 404', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.idea.findFirst).mockResolvedValue(
      recommendedIdeaFixture({
        research: {
          id: 'other-r',
          userId: 'other-user',
          topic: 'private topic',
        },
      }) as never,
    );

    const { GET } = await import('@/app/api/ideas/[ideaId]/route');
    const response = await GET(
      new Request('http://localhost/api/ideas/idea-rec-1'),
      { params: Promise.resolve({ ideaId: 'idea-rec-1' }) },
    );

    expect(response.status).toBe(404);
  });
});
