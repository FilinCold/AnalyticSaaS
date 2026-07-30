import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/get-session', () => ({
  requireAuth: vi.fn(),
}));

import { requireAuth } from '@/lib/auth/get-session';

describe('GET /api/ideas', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('T1: anonymous returns 401', async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      Response.json({ error: 'Не авторизован' }, { status: 401 }),
    );

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('T2: session returns empty feed stub + stats', async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      email: 'a@b.c',
    });

    const { GET } = await import('@/app/api/ideas/route');
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ideas).toEqual([]);
    expect(body.stats).toEqual({
      recommendedCount: 0,
      narrowedCount: 0,
      excludedCount: 0,
      lastPipelineFinishedAt: null,
    });
  });
});
