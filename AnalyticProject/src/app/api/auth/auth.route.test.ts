import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

describe('auth API routes', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('GET /api/auth/session returns 401 without session', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue(null);

    const { GET } = await import('@/app/api/auth/session/route');
    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('GET /api/auth/session returns user when authenticated', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.co' },
      expires: new Date(Date.now() + 60_000).toISOString(),
    });

    const { GET } = await import('@/app/api/auth/session/route');
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      user: { id: 'u1', email: 'a@b.co' },
    });
  });

  it('POST /api/auth/login returns 401 on AuthError', async () => {
    const { signIn } = await import('@/auth');
    vi.mocked(signIn).mockRejectedValue({
      type: 'CredentialsSignin',
      name: 'CredentialsSignin',
    });

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.co', password: 'wrongpass' }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it('POST /api/auth/login returns 200 on success', async () => {
    const { signIn } = await import('@/auth');
    vi.mocked(signIn).mockResolvedValue(undefined as never);

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.co', password: 'password123' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });
});
