import { PrismaClient } from '@prisma/client';

import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

const SYSTEM_FEED_TOPIC = '__system_feed__';

/** Wipe system feed artifacts so auto-initial can run again for E2E. */
export async function resetSystemFeed(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    const system = await prisma.research.findFirst({
      where: { topic: SYSTEM_FEED_TOPIC },
      select: { id: true },
    });
    if (!system) return;

    await prisma.idea.deleteMany({ where: { researchId: system.id } });
    await prisma.painCluster.deleteMany({ where: { researchId: system.id } });
    await prisma.pipelineRun.deleteMany({ where: { researchId: system.id } });
    await prisma.signal.deleteMany({ where: { researchId: system.id } });
    await prisma.research.delete({ where: { id: system.id } });
  } finally {
    await prisma.$disconnect();
  }
}
