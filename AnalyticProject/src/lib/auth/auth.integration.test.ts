import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabaseUrl)('auth register (integration)', () => {
  const email = `auth-test-${Date.now()}@example.com`;
  const password = 'password123';

  beforeAll(async () => {
    const { prisma } = await import('@/lib/prisma');
    await prisma.user.deleteMany({ where: { email } });
  });

  afterAll(async () => {
    const { prisma } = await import('@/lib/prisma');
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('creates user on valid register', async () => {
    const { registerUser } = await import('@/lib/auth/register');

    const user = await registerUser(email, password);

    expect(user.email).toBe(email);
    expect(user.id).toBeTruthy();
  });

  it('rejects duplicate email with 409', async () => {
    const { registerUser } = await import('@/lib/auth/register');

    await expect(registerUser(email, password)).rejects.toMatchObject({
      status: 409,
    });
  });

  it('authenticates with correct password and rejects wrong', async () => {
    const { authenticateUser } = await import('@/lib/auth/credentials');

    const ok = await authenticateUser(email, password);
    const bad = await authenticateUser(email, 'wrong-password');

    expect(ok).toEqual({ id: expect.any(String), email });
    expect(bad).toBeNull();
  });
});
