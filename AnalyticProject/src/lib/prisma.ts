import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

function getPrismaClient(): PrismaClient {
  const existing = globalForPrisma.prisma;
  // HMR can keep a client generated before User model existed.
  const needsRefresh =
    existing !== undefined &&
    !('user' in (existing as object));

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
