import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/dev/trigger-hello/route';

describe('POST /api/dev/trigger-hello', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns 404 outside development', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const response = await POST(
      new Request('http://localhost/api/dev/trigger-hello', {
        method: 'POST',
        body: JSON.stringify({ message: 'test' }),
      }),
    );

    expect(response.status).toBe(404);
  });

  it('enqueues hello job in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const helloModule = await import('@/jobs/hello');
    const enqueueSpy = vi
      .spyOn(helloModule, 'enqueueHelloJob')
      .mockResolvedValue({ ids: ['evt-dev-1'] });

    const response = await POST(
      new Request('http://localhost/api/dev/trigger-hello', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'from-dev-route', runId: 'dev-1' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, eventIds: ['evt-dev-1'] });
    expect(enqueueSpy).toHaveBeenCalledWith({
      message: 'from-dev-route',
      runId: 'dev-1',
    });
  });

  it('returns 502 with hint when enqueue fails', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const helloModule = await import('@/jobs/hello');
    vi.spyOn(helloModule, 'enqueueHelloJob').mockRejectedValue(
      new Error('fetch failed'),
    );

    const response = await POST(
      new Request('http://localhost/api/dev/trigger-hello', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'fail-case' }),
      }),
    );

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe('Failed to enqueue hello job');
    expect(body.hint).toContain('inngest:dev');
  });
});
