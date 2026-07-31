import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/get-session', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    research: {
      findFirst: vi.fn(),
    },
    idea: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { requireAuth } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';

const systemFeed = {
  id: 'sys-1',
  lastPipelineFinishedAt: new Date('2026-07-30T12:00:00.000Z'),
};

function recommendedRow(
  overrides: Partial<{
    id: string;
    opportunityScore: number;
    oneJobScore: number;
    aiBuildabilityScore: number;
    firstSalePotential: number;
    estimatedBuildDays: number;
    oneJobTemplate: string | null;
    problem: string;
  }> = {},
) {
  return {
    id: overrides.id ?? 'idea-a',
    status: 'recommended',
    problem: overrides.problem ?? 'Pain A',
    oneJobTemplate:
      overrides.oneJobTemplate === undefined
        ? 'For X who Y, the product Z'
        : overrides.oneJobTemplate,
    oneJobScore: overrides.oneJobScore ?? 85,
    aiBuildabilityScore: overrides.aiBuildabilityScore ?? 80,
    firstSalePotential: overrides.firstSalePotential ?? 75,
    estimatedBuildDays: overrides.estimatedBuildDays ?? 10,
    opportunityScore: overrides.opportunityScore ?? 90,
    exclusionReasons: [],
  };
}

describe('GET /api/ideas', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T0: anonymous returns 401', async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      Response.json({ error: 'Не авторизован' }, { status: 401 }),
    );

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(new Request('http://localhost/api/ideas'));

    expect(response.status).toBe(401);
  });

  it('T1: 2 recommended different opportunity — higher first', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.research.findFirst).mockResolvedValue(systemFeed as never);
    vi.mocked(prisma.idea.groupBy).mockResolvedValue([
      { status: 'recommended', _count: { _all: 2 } },
    ] as never);
    vi.mocked(prisma.idea.findMany).mockResolvedValue([
      recommendedRow({ id: 'high', opportunityScore: 95, problem: 'High' }),
      recommendedRow({ id: 'low', opportunityScore: 70, problem: 'Low' }),
    ] as never);

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(
      new Request('http://localhost/api/ideas?status=recommended'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toHaveLength(2);
    expect(body.ideas[0].id).toBe('high');
    expect(body.ideas[0].opportunityScore).toBe(95);
    expect(body.ideas[1].id).toBe('low');
    expect(prisma.idea.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { researchId: 'sys-1', status: 'recommended' },
        orderBy: [{ opportunityScore: 'desc' }, { createdAt: 'desc' }],
      }),
    );
  });

  it('T2: excluded idea not in recommended list', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.research.findFirst).mockResolvedValue(systemFeed as never);
    vi.mocked(prisma.idea.groupBy).mockResolvedValue([
      { status: 'excluded', _count: { _all: 1 } },
    ] as never);
    vi.mocked(prisma.idea.findMany).mockResolvedValue([]);

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(
      new Request('http://localhost/api/ideas?status=recommended'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toEqual([]);
    expect(body.stats.excludedCount).toBe(1);
    expect(body.stats.recommendedCount).toBe(0);
  });

  it('T2b: status=recommended below threshold filtered out (guard)', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.research.findFirst).mockResolvedValue(systemFeed as never);
    vi.mocked(prisma.idea.groupBy).mockResolvedValue([
      { status: 'recommended', _count: { _all: 1 } },
    ] as never);
    vi.mocked(prisma.idea.findMany).mockResolvedValue([
      recommendedRow({
        id: 'bad',
        oneJobScore: 50,
        opportunityScore: 99,
      }),
    ] as never);

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(new Request('http://localhost/api/ideas'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toEqual([]);
  });

  it('T3: empty recommended returns stats with excluded count', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.research.findFirst).mockResolvedValue(systemFeed as never);
    vi.mocked(prisma.idea.groupBy).mockResolvedValue([
      { status: 'excluded', _count: { _all: 3 } },
    ] as never);
    vi.mocked(prisma.idea.findMany).mockResolvedValue([]);

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(new Request('http://localhost/api/ideas'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toEqual([]);
    expect(body.stats).toEqual({
      recommendedCount: 0,
      narrowedCount: 0,
      excludedCount: 3,
      lastPipelineFinishedAt: '2026-07-30T12:00:00.000Z',
    });
  });

  it('T1 excluded: status=excluded returns idea with both reason codes', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.research.findFirst).mockResolvedValue(systemFeed as never);
    vi.mocked(prisma.idea.groupBy).mockResolvedValue([
      { status: 'excluded', _count: { _all: 1 } },
      { status: 'recommended', _count: { _all: 1 } },
    ] as never);
    vi.mocked(prisma.idea.findMany).mockResolvedValue([
      {
        id: 'ex-1',
        status: 'excluded',
        problem: 'Excluded pain',
        oneJobTemplate: 'For X…',
        oneJobScore: 50,
        aiBuildabilityScore: 80,
        firstSalePotential: 75,
        estimatedBuildDays: 20,
        opportunityScore: 40,
        exclusionReasons: ['below_one_job', 'exceeds_14_days'],
      },
    ] as never);

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(
      new Request('http://localhost/api/ideas?status=excluded'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toHaveLength(1);
    expect(body.ideas[0].id).toBe('ex-1');
    expect(body.ideas[0].exclusionReasons).toEqual([
      'below_one_job',
      'exceeds_14_days',
    ]);
    expect(prisma.idea.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { researchId: 'sys-1', status: 'excluded' },
      }),
    );
  });

  it('T2 excluded: recommended not returned when status=excluded', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.research.findFirst).mockResolvedValue(systemFeed as never);
    vi.mocked(prisma.idea.groupBy).mockResolvedValue([
      { status: 'recommended', _count: { _all: 1 } },
      { status: 'excluded', _count: { _all: 0 } },
    ] as never);
    vi.mocked(prisma.idea.findMany).mockResolvedValue([]);

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(
      new Request('http://localhost/api/ideas?status=excluded'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toEqual([]);
    expect(body.stats.recommendedCount).toBe(1);
    expect(prisma.idea.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { researchId: 'sys-1', status: 'excluded' },
      }),
    );
  });

  it('T1 narrowed: status=narrowed returns idea with featuresExcludedToFitDeadline', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.research.findFirst).mockResolvedValue(systemFeed as never);
    vi.mocked(prisma.idea.groupBy).mockResolvedValue([
      { status: 'narrowed', _count: { _all: 1 } },
      { status: 'recommended', _count: { _all: 1 } },
    ] as never);
    vi.mocked(prisma.idea.findMany).mockResolvedValue([
      {
        id: 'nar-1',
        status: 'narrowed',
        problem: 'Narrowed pain',
        oneJobTemplate: 'For X…',
        oneJobScore: 80,
        aiBuildabilityScore: 75,
        firstSalePotential: 70,
        estimatedBuildDays: 12,
        opportunityScore: 72,
        exclusionReasons: [],
        featuresExcludedToFitDeadline: ['SSO', 'Mobile app'],
      },
    ] as never);

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(
      new Request('http://localhost/api/ideas?status=narrowed'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toHaveLength(1);
    expect(body.ideas[0].id).toBe('nar-1');
    expect(body.ideas[0].status).toBe('narrowed');
    expect(body.ideas[0].featuresExcludedToFitDeadline).toEqual([
      'SSO',
      'Mobile app',
    ]);
    expect(body.stats.narrowedCount).toBe(1);
    expect(prisma.idea.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { researchId: 'sys-1', status: 'narrowed' },
      }),
    );
  });

  it('T2 narrowed: recommended not returned when status=narrowed', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.research.findFirst).mockResolvedValue(systemFeed as never);
    vi.mocked(prisma.idea.groupBy).mockResolvedValue([
      { status: 'recommended', _count: { _all: 1 } },
      { status: 'narrowed', _count: { _all: 0 } },
    ] as never);
    vi.mocked(prisma.idea.findMany).mockResolvedValue([]);

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(
      new Request('http://localhost/api/ideas?status=narrowed'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toEqual([]);
    expect(body.stats.recommendedCount).toBe(1);
    expect(prisma.idea.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { researchId: 'sys-1', status: 'narrowed' },
      }),
    );
  });

  it('invalid status returns 400', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(
      new Request('http://localhost/api/ideas?status=bogus'),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/status/i);
  });

  it('no system feed returns empty stub', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });
    vi.mocked(prisma.research.findFirst).mockResolvedValue(null);

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET(new Request('http://localhost/api/ideas'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toEqual([]);
    expect(body.stats).toEqual({
      recommendedCount: 0,
      narrowedCount: 0,
      excludedCount: 0,
      lastPipelineFinishedAt: null,
    });
  });
});
