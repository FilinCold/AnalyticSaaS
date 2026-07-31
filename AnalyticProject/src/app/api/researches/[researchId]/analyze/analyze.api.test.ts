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
      count: vi.fn(),
    },
    pipelineRun: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/jobs/pipeline.run', () => ({
  enqueuePipelineRun: vi.fn().mockResolvedValue({ ids: ['evt-1'] }),
}));

const ownedResearch = { id: 'r1' };

const queuedRun = {
  id: 'run-1',
  researchId: 'r1',
  status: 'queued',
  trigger: 'manual',
  currentStep: null,
  error: null,
  createdAt: new Date('2026-07-31T12:00:00.000Z'),
  finishedAt: null,
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

describe('analyze API', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T1: POST analyze valid returns 202 with run queued', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.signal.count).mockResolvedValue(2);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.pipelineRun.create).mockResolvedValue(queuedRun as never);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/analyze/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({
      pipelineRun: {
        id: 'run-1',
        status: 'queued',
        trigger: 'manual',
        createdAt: '2026-07-31T12:00:00.000Z',
      },
    });
    expect(prisma.pipelineRun.create).toHaveBeenCalledWith({
      data: {
        researchId: 'r1',
        status: 'queued',
        trigger: 'manual',
      },
    });
    expect(enqueuePipelineRun).toHaveBeenCalledWith({
      researchId: 'r1',
      pipelineRunId: 'run-1',
      trigger: 'manual',
    });
  });

  it('T6: trigger=manual saved when body omitted', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.signal.count).mockResolvedValue(1);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.pipelineRun.create).mockResolvedValue(queuedRun as never);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/analyze/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/analyze', {
        method: 'POST',
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(202);
    expect(prisma.pipelineRun.create).toHaveBeenCalledWith({
      data: {
        researchId: 'r1',
        status: 'queued',
        trigger: 'manual',
      },
    });
  });

  it('enqueue failure returns 502 with inngest hint', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    const { enqueuePipelineRun } = await import('@/jobs/pipeline.run');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.signal.count).mockResolvedValue(1);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.pipelineRun.create).mockResolvedValue(queuedRun as never);
    vi.mocked(prisma.pipelineRun.update).mockResolvedValue({} as never);
    vi.mocked(enqueuePipelineRun).mockRejectedValueOnce(new Error('fetch failed'));

    const { POST } = await import(
      '@/app/api/researches/[researchId]/analyze/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.code).toBe('ENQUEUE_FAILED');
    expect(body.hint).toContain('inngest:dev');
    expect(prisma.pipelineRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'run-1' },
        data: expect.objectContaining({ status: 'failed' }),
      }),
    );
  });

  it('T2: Second POST while running returns 409', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.signal.count).mockResolvedValue(1);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue({
      id: 'active',
      status: 'running',
    } as never);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/analyze/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(409);
    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
  });

  it('T3: Manual within 5 min returns 409', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.signal.count).mockResolvedValue(1);
    // First findFirst = active run check → null; second = cooldown check
    vi.mocked(prisma.pipelineRun.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'recent',
        createdAt: new Date(Date.now() - 60_000),
        trigger: 'manual',
      } as never);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/analyze/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(409);
    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
  });

  it('T4: No signals returns 422', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.signal.count).mockResolvedValue(0);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/analyze/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(422);
    expect(prisma.pipelineRun.create).not.toHaveBeenCalled();
  });

  it('T7: чужой research returns 404', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-b'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(null);

    const { POST } = await import(
      '@/app/api/researches/[researchId]/analyze/route'
    );
    const response = await POST(
      new Request('http://localhost/api/researches/r1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      }),
      routeContext('r1'),
    );

    expect(response.status).toBe(404);
  });
});

describe('pipeline-runs status API', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T5: GET latest returns correct status progression', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue({
      id: 'run-1',
      researchId: 'r1',
      status: 'running',
      trigger: 'manual',
      currentStep: 'extract',
      error: null,
      createdAt: new Date('2026-07-31T12:00:00.000Z'),
      finishedAt: null,
    } as never);

    const { GET } = await import(
      '@/app/api/researches/[researchId]/pipeline-runs/latest/route'
    );
    const response = await GET(
      new Request('http://localhost/api/researches/r1/pipeline-runs/latest'),
      routeContext('r1'),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: 'run-1',
      status: 'running',
      trigger: 'manual',
      currentStep: 'extract',
      error: null,
      createdAt: '2026-07-31T12:00:00.000Z',
      finishedAt: null,
    });
  });

  it('GET run by id returns 200', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue({
      id: 'run-1',
      researchId: 'r1',
      status: 'succeeded',
      trigger: 'manual',
      currentStep: 'finish',
      error: null,
      createdAt: new Date('2026-07-31T12:00:00.000Z'),
      finishedAt: new Date('2026-07-31T12:05:00.000Z'),
    } as never);

    const { GET } = await import(
      '@/app/api/researches/[researchId]/pipeline-runs/[runId]/route'
    );
    const response = await GET(
      new Request('http://localhost/api/researches/r1/pipeline-runs/run-1'),
      {
        params: Promise.resolve({ researchId: 'r1', runId: 'run-1' }),
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: 'run-1',
      status: 'succeeded',
      trigger: 'manual',
      currentStep: 'finish',
      error: null,
      createdAt: '2026-07-31T12:00:00.000Z',
      finishedAt: '2026-07-31T12:05:00.000Z',
    });
  });

  it('GET latest when no runs returns 404', async () => {
    const { auth } = await import('@/auth');
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(prisma.research.findFirst).mockResolvedValue(ownedResearch as never);
    vi.mocked(prisma.pipelineRun.findFirst).mockResolvedValue(null);

    const { GET } = await import(
      '@/app/api/researches/[researchId]/pipeline-runs/latest/route'
    );
    const response = await GET(
      new Request('http://localhost/api/researches/r1/pipeline-runs/latest'),
      routeContext('r1'),
    );

    expect(response.status).toBe(404);
  });
});
