import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/dev/cron/schedule-refresh/route';

describe('POST /api/dev/cron/schedule-refresh', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns 404 outside development', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const response = await POST(
      new Request('http://localhost/api/dev/cron/schedule-refresh', {
        method: 'POST',
      }),
    );

    expect(response.status).toBe(404);
  });

  it('runs schedule-refresh in-process in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const scheduleModule = await import('@/lib/pipeline/schedule-refresh');
    const runSpy = vi.spyOn(scheduleModule, 'runScheduleRefresh').mockResolvedValue({
      enqueued: [{ researchId: 'r1', pipelineRunId: 'run-1' }],
      skipped: [],
    });

    const response = await POST(
      new Request('http://localhost/api/dev/cron/schedule-refresh', {
        method: 'POST',
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      mode: 'direct',
      enqueued: [{ researchId: 'r1', pipelineRunId: 'run-1' }],
      skipped: [],
    });
    expect(runSpy).toHaveBeenCalledOnce();
  });

  it('enqueues via Inngest when body.enqueue=true', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const jobModule = await import('@/jobs/schedule-refresh');
    const enqueueSpy = vi
      .spyOn(jobModule, 'enqueueScheduleRefresh')
      .mockResolvedValue({ ids: ['evt-cron-1'] });

    const response = await POST(
      new Request('http://localhost/api/dev/cron/schedule-refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enqueue: true }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      mode: 'inngest',
      eventIds: ['evt-cron-1'],
    });
    expect(enqueueSpy).toHaveBeenCalledOnce();
  });
});
