import { prisma } from '@/lib/prisma';
import { SYSTEM_FEED_TOPIC } from '@/lib/signal/system-feed';

import { passesRecommendedGuard } from './recommended-guard';
import { toIdeaListItem, type IdeaListRecord } from './serialize';

export const IDEA_FEED_STATUSES = [
  'recommended',
  'narrowed',
  'excluded',
  'candidate',
] as const;

export type IdeaFeedStatus = (typeof IDEA_FEED_STATUSES)[number];

export type IdeasFeedStats = {
  recommendedCount: number;
  narrowedCount: number;
  excludedCount: number;
  lastPipelineFinishedAt: string | null;
};

export type IdeasFeedResult = {
  ideas: ReturnType<typeof toIdeaListItem>[];
  stats: IdeasFeedStats;
};

const LIST_SELECT = {
  id: true,
  status: true,
  problem: true,
  oneJobTemplate: true,
  oneJobScore: true,
  aiBuildabilityScore: true,
  firstSalePotential: true,
  estimatedBuildDays: true,
  opportunityScore: true,
  exclusionReasons: true,
  featuresExcludedToFitDeadline: true,
} as const;

export function parseIdeaFeedStatus(
  raw: string | null | undefined,
): IdeaFeedStatus | null {
  if (raw == null || raw === '') return 'recommended';
  if ((IDEA_FEED_STATUSES as readonly string[]).includes(raw)) {
    return raw as IdeaFeedStatus;
  }
  return null;
}

export async function listIdeasFeed(
  status: IdeaFeedStatus = 'recommended',
): Promise<IdeasFeedResult> {
  const emptyStats: IdeasFeedStats = {
    recommendedCount: 0,
    narrowedCount: 0,
    excludedCount: 0,
    lastPipelineFinishedAt: null,
  };

  const systemFeed = await prisma.research.findFirst({
    where: { topic: SYSTEM_FEED_TOPIC },
    select: {
      id: true,
      lastPipelineFinishedAt: true,
    },
  });

  if (!systemFeed) {
    return { ideas: [], stats: emptyStats };
  }

  const [grouped, rows] = await Promise.all([
    prisma.idea.groupBy({
      by: ['status'],
      where: { researchId: systemFeed.id },
      _count: { _all: true },
    }),
    prisma.idea.findMany({
      where: { researchId: systemFeed.id, status },
      select: LIST_SELECT,
      orderBy: [{ opportunityScore: 'desc' }, { createdAt: 'desc' }],
    }),
  ]);

  const countByStatus = Object.fromEntries(
    grouped.map((g) => [g.status, g._count._all]),
  ) as Record<string, number>;

  const stats: IdeasFeedStats = {
    recommendedCount: countByStatus.recommended ?? 0,
    narrowedCount: countByStatus.narrowed ?? 0,
    excludedCount: countByStatus.excluded ?? 0,
    lastPipelineFinishedAt: systemFeed.lastPipelineFinishedAt
      ? systemFeed.lastPipelineFinishedAt.toISOString()
      : null,
  };

  let ideas = rows as IdeaListRecord[];
  if (status === 'recommended') {
    ideas = ideas.filter(passesRecommendedGuard);
  }

  return {
    ideas: ideas.map(toIdeaListItem),
    stats,
  };
}
