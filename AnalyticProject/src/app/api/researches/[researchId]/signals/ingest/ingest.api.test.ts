import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    research: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/domain/signals/ingest', () => ({
  ingestAdapterSignals: vi.fn(),
}));

function session(userId: string, email = `${userId}@ex.co`) {
  return {
    user: { id: userId, email },
    expires: new Date(Date.now() + 60_000).toISOString(),
  };
}

function routeContext(researchId: string) {
  return { params: Promise.resolve({ researchId }) };
}

describe('POST /api/researches/[id]/signals/ingest', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T3: ingest foreign research returns 404', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const { ingestAdapterSignals } = await import('@/domain/signals/ingest');

    vi.mocked(auth).mockResolvedValue(session('user-b'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(null);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/signals/ingest/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/signals/ingest', {
        method: 'POST',
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(404);
    expect(ingestAdapterSignals).not.toHaveBeenCalled();
  });

  it('owned research runs ingest', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const { ingestAdapterSignals } = await import('@/domain/signals/ingest');

    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue({
      id: 'r1',
      topic: 'billing',
      keywords: ['invoice'],
    } as never);
    vi.mocked(ingestAdapterSignals).mockResolvedValue({
      researchId: 'r1',
      ingestedCount: 2,
      bySource: { hackernews: 2 },
      errors: [],
    });

    const { POST } = await import(
      '@/app/api/researches/[researchId]/signals/ingest/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/signals/ingest', {
        method: 'POST',
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ingestedCount: 2,
      bySource: { hackernews: 2 },
      errors: [],
    });
  });
});
