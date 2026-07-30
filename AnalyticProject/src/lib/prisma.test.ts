import { describe, expect, it } from 'vitest';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabaseUrl)('prisma', () => {
  it('connects and runs SELECT 1', async () => {
    const { prisma } = await import('@/lib/prisma');

    const result = await prisma.$queryRaw<{ '?column?': number }[]>`SELECT 1`;

    expect(result[0]['?column?']).toBe(1);

    await prisma.$disconnect();
  });
});

describe('prisma (no DATABASE_URL)', () => {
  it.skipIf(hasDatabaseUrl)('skips integration when DATABASE_URL is unset', () => {
    expect(process.env.DATABASE_URL).toBeUndefined();
  });
});
