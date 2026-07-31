import { prisma } from '@/lib/prisma';
import { SYSTEM_FEED_TOPIC } from '@/lib/signal/system-feed';
import type { Idea } from '@prisma/client';

/**
 * Load idea for mutating APIs. System-feed: any auth user.
 * Other research: only owner. Missing/foreign → null.
 */
export async function findIdeaForUser(
  ideaId: string,
  userId: string,
): Promise<(Idea & { researchId: string }) | null> {
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

  const { research: _research, ...idea } = row;
  void _research;
  return idea;
}

export async function hasActivePipelineRun(
  researchId: string,
): Promise<boolean> {
  const active = await prisma.pipelineRun.findFirst({
    where: {
      researchId,
      status: { in: ['queued', 'running'] },
    },
    select: { id: true },
  });
  return active != null;
}
