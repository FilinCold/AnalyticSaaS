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
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const researchRow = {
  id: 'r1',
  userId: 'user-a',
  title: 'Niche scan',
  topic: 'B2B analytics',
  keywords: ['saas', 'pain'],
  status: 'draft',
  autoRefreshEnabled: true,
  lastPipelineFinishedAt: null,
  createdAt: new Date('2026-07-29T10:00:00.000Z'),
  updatedAt: new Date('2026-07-29T10:00:00.000Z'),
};

const apiShape = {
  id: 'r1',
  title: 'Niche scan',
  topic: 'B2B analytics',
  keywords: ['saas', 'pain'],
  status: 'draft',
  autoRefreshEnabled: true,
  lastPipelineFinishedAt: null,
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:00:00.000Z',
};

function session(userId: string, email = `${userId}@ex.co`) {
  return {
    user: { id: userId, email },
    expires: new Date(Date.now() + 60_000).toISOString(),
  };
}

describe('research API', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T7: POST /api/researches without session returns 401', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue(null);

    const { POST } = await import('@/app/api/researches/route');
    const response = await POST(
      new Request('http://localhost/api/researches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'x',
          topic: 'y',
          keywords: [],
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it('T2: POST without title returns 400', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue(session('user-a'));

    const { POST } = await import('@/app/api/researches/route');
    const response = await POST(
      new Request('http://localhost/api/researches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'y', keywords: [] }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it('T1: POST create valid returns 201 with status=draft', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.create).mockResolvedValue(researchRow);

    const { POST } = await import('@/app/api/researches/route');
    const response = await POST(
      new Request('http://localhost/api/researches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Niche scan',
          topic: 'B2B analytics',
          keywords: ['saas', 'pain'],
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(apiShape);
    expect(prisma.research.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-a',
        title: 'Niche scan',
        topic: 'B2B analytics',
        keywords: ['saas', 'pain'],
      },
    });
  });

  it('T3: GET list returns only own researches', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findMany).mockResolvedValue([researchRow]);

    const { GET } = await import('@/app/api/researches/route');
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ researches: [apiShape] });
    expect(prisma.research.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-a' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('T4: GET foreign research id returns 404', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-b'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(null);

    const { GET } = await import('@/app/api/researches/[researchId]/route');
    const response = await GET(new Request('http://localhost/api/researches/r1'), {
      params: Promise.resolve({ researchId: 'r1' }),
    });

    expect(response.status).toBe(404);
    expect(prisma.research.findFirst).toHaveBeenCalledWith({
      where: { id: 'r1', userId: 'user-b' },
    });
  });

  it('T5: PATCH own research returns 200', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const updated = {
      ...researchRow,
      title: 'Updated',
      updatedAt: new Date('2026-07-29T11:00:00.000Z'),
    };
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(researchRow);
    vi.mocked(prisma.research.update).mockResolvedValue(updated);

    const { PATCH } = await import('@/app/api/researches/[researchId]/route');
    const response = await PATCH(
      new Request('http://localhost/api/researches/r1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      }),
      { params: Promise.resolve({ researchId: 'r1' }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      id: 'r1',
      title: 'Updated',
      status: 'draft',
    });
  });

  it('T6: PATCH foreign research returns 404', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-b'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(null);

    const { PATCH } = await import('@/app/api/researches/[researchId]/route');
    const response = await PATCH(
      new Request('http://localhost/api/researches/r1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Hijack' }),
      }),
      { params: Promise.resolve({ researchId: 'r1' }) },
    );

    expect(response.status).toBe(404);
    expect(prisma.research.update).not.toHaveBeenCalled();
  });
});
