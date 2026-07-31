import { prisma } from '@/lib/prisma';

/** Marker topic for platform-wide ingest (ideas feed). */
export const SYSTEM_FEED_TOPIC = '__system_feed__';

export const SYSTEM_FEED_KEYWORDS = [
  'saas',
  'micro-saas',
  'startup',
  'pain point',
  'indie hacker',
];

/**
 * One shared Research for adapter ingest → ideas feed.
 * First caller creates it; later callers reuse regardless of owner (solo MVP).
 */
export async function getOrCreateSystemResearch(userId: string) {
  const existing = await prisma.research.findFirst({
    where: { topic: SYSTEM_FEED_TOPIC },
  });
  if (existing) return existing;

  return prisma.research.create({
    data: {
      userId,
      title: 'System feed',
      topic: SYSTEM_FEED_TOPIC,
      keywords: SYSTEM_FEED_KEYWORDS,
      status: 'active',
    },
  });
}
