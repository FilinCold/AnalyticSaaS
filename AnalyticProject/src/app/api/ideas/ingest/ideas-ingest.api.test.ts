import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock('@/lib/signal/system-feed', () => ({
  getOrCreateSystemResearch: vi.fn(),
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

describe('POST /api/ideas/ingest', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('anonymous returns 401', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue(null);

    const { POST } = await import('@/app/api/ideas/ingest/route');
    const response = await POST();

    expect(response.status).toBe(401);
  });

  it('session ingests into system feed', async () => {
    const { auth } = await import('@/auth');
    const { getOrCreateSystemResearch } = await import(
      '@/lib/signal/system-feed'
    );
    const { ingestAdapterSignals } = await import('@/domain/signals/ingest');

    vi.mocked(auth).mockResolvedValue(session('user-a'));
    vi.mocked(getOrCreateSystemResearch).mockResolvedValue({
      id: 'sys-1',
      topic: '__system_feed__',
      keywords: ['saas'],
    } as never);
    vi.mocked(ingestAdapterSignals).mockResolvedValue({
      researchId: 'sys-1',
      ingestedCount: 6,
      bySource: { hackernews: 2, producthunt: 2, reddit: 2 },
      errors: [],
    });

    const { POST } = await import('@/app/api/ideas/ingest/route');
    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ingestedCount).toBe(6);
    expect(body.researchId).toBe('sys-1');
    expect(getOrCreateSystemResearch).toHaveBeenCalledWith('user-a');
    expect(ingestAdapterSignals).toHaveBeenCalledWith({
      id: 'sys-1',
      topic: '__system_feed__',
      keywords: ['saas'],
    });
  });
});
