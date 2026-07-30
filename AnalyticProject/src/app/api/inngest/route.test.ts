import { afterEach, describe, expect, it, vi } from 'vitest';

describe('GET /api/inngest', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('responds without 500 when INNGEST_DEV=1', async () => {
    vi.stubEnv('INNGEST_DEV', '1');

    const { GET } = await import('@/app/api/inngest/route');
    const response = await GET(new Request('http://localhost:3010/api/inngest'), {});

    expect(response.status).not.toBe(500);
  });
});
