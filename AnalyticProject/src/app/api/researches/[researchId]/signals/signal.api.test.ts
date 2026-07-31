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
    signal: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/pipeline/maybe-trigger-initial', () => ({
  maybeTriggerInitialPipeline: vi.fn().mockResolvedValue(undefined),
}));

const ownedResearch = { id: 'r1' };

const signalRow = {
  id: 's1',
  researchId: 'r1',
  sourceType: 'manual',
  sourceUrl: null,
  rawText: 'Pain about billing',
  normalizedText: null,
  authorHint: null,
  capturedAt: new Date('2026-07-30T12:00:00.000Z'),
  metadata: {},
};

const signalApi = {
  id: 's1',
  sourceType: 'manual',
  sourceUrl: null,
  rawText: 'Pain about billing',
  normalizedText: null,
  authorHint: null,
  capturedAt: '2026-07-30T12:00:00.000Z',
  metadata: {},
};

function session(userId: string, email = `${userId}@ex.co`) {
  return {
    user: { id: userId, email },
    expires: new Date(Date.now() + 60_000).toISOString(),
  };
}

function routeContext(researchId: string) {
  return { params: Promise.resolve({ researchId }) };
}

describe('signal API', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T1: POST valid signal returns 201 with sourceType=manual', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const { maybeTriggerInitialPipeline } = await import(
      '@/lib/pipeline/maybe-trigger-initial'
    );
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.signal.create).mockResolvedValue(signalRow as never);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/signals/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: 'Pain about billing' }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(signalApi);
    expect(prisma.signal.create).toHaveBeenCalledWith({
      data: {
        researchId: 'r1',
        sourceType: 'manual',
        rawText: 'Pain about billing',
        capturedAt: expect.any(Date),
      },
    });
    expect(maybeTriggerInitialPipeline).toHaveBeenCalledWith('r1');
  });

  it('T2: POST empty rawText returns 400', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/signals/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: '   ' }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(400);
    expect(prisma.signal.create).not.toHaveBeenCalled();
  });

  it('T3: POST >50000 chars returns 400', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/signals/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: 'x'.repeat(50_001) }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(400);
    expect(prisma.signal.create).not.toHaveBeenCalled();
  });

  it('T4: GET list returns 3 signals', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const rows = [1, 2, 3].map((n) => ({
      ...signalRow,
      id: `s${n}`,
      rawText: `Signal ${n}`,
    }));
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.signal.findMany).mockResolvedValue(rows as never);

    const { GET } = await import(
      '@/app/api/researches/[researchId]/signals/route'
    );
    const response = await GET(
      new Request('http://localhost/api/researches/r1/signals'),
      routeContext('r1'),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.signals).toHaveLength(3);
    expect(prisma.signal.findMany).toHaveBeenCalledWith({
      where: { researchId: 'r1' },
      orderBy: { capturedAt: 'desc' },
    });
  });

  it('T5: POST to foreign research returns 404', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-b'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(null);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/signals/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: 'Hijack' }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(404);
    expect(prisma.signal.create).not.toHaveBeenCalled();
    expect(prisma.research.findFirst).toHaveBeenCalledWith({
      where: { id: 'r1', userId: 'user-b' },
      select: { id: true },
    });
  });
});
