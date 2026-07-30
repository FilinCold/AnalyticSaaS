import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

describe('auth-guard', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('T1: GET /api/me without session returns 401', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue(null);

    const { GET } = await import('@/app/api/me/route');
    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Не авторизован' });
  });

  it('T2: GET /api/me with session returns user', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.co' },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const { GET } = await import('@/app/api/me/route');
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      user: { id: 'u1', email: 'a@b.co' },
    });
  });

  it('T3: protectRequest redirects page to /login when anonymous', async () => {
    const { protectRequest } = await import('@/lib/auth/guard');
    const response = protectRequest(false, '/ideas', 'http://localhost:3010');

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3010/login?callbackUrl=%2Fideas',
    );
  });

  it('T3b: protectRequest returns 401 JSON for anonymous API', async () => {
    const { protectRequest } = await import('@/lib/auth/guard');
    const response = protectRequest(false, '/api/me', 'http://localhost:3010');

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Не авторизован' });
  });

  it('T4: middleware matcher leaves /login and public APIs unprotected', async () => {
    const { middlewareMatcher } = await import('@/lib/auth/guard');
    const joined = middlewareMatcher.join(' ');

    expect(joined).not.toMatch(/login/);
    expect(joined).not.toMatch(/api\/auth/);
    expect(joined).not.toMatch(/api\/health/);
    expect(middlewareMatcher).toEqual([
      '/ideas',
      '/ideas/:path*',
      '/researches/:path*',
      '/api/researches/:path*',
      '/api/ideas',
      '/api/ideas/:path*',
      '/api/me',
    ]);
  });
});
