import { prisma } from '@/lib/prisma';
import { SYSTEM_FEED_TOPIC } from '@/lib/signal/system-feed';

import { toIdeaDetail, type IdeaDetailRecord } from './serialize';

export type IdeaDetail = ReturnType<typeof toIdeaDetail>;

/**
 * Full idea card. System-feed ideas: any auth user.
 * Other research ideas: only research.userId owner.
 */
export async function getIdeaDetail(
  ideaId: string,
  userId: string,
): Promise<IdeaDetail | null> {
  const row = await prisma.idea.findFirst({
    where: { id: ideaId },
    include: {
      research: {
        select: { id: true, userId: true, topic: true },
      },
    },
  });

  if (!row) return null;

  const isSystemFeed = row.research.topic === SYSTEM_FEED_TOPIC;
  const isOwner = row.research.userId === userId;
  if (!isSystemFeed && !isOwner) return null;

  const { research, ...idea } = row;
  void research;
  return toIdeaDetail(idea as IdeaDetailRecord);
}
