import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

/** Delegates that must exist; HMR may keep a client from an older generate. */
const REQUIRED_DELEGATES = ['user', 'research', 'signal', 'idea', 'pipelineRun'] as const;

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  const needsRefresh =
    existing !== undefined &&
    REQUIRED_DELEGATES.some((key) => !(key in (existing as object)));

  if (needsRefresh && existing) {
    void existing.$disconnect();
    globalForPrisma.prisma = undefined;
  } else if (existing) {
    return existing;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
