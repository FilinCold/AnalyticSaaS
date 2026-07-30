import { afterEach, describe, expect, it, vi } from 'vitest';

import * as helloModule from '@/jobs/hello';
import { handleHelloJob } from '@/jobs/hello';

describe('hello job', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('processes hello payload via onHelloProcessed', async () => {
    const spy = vi.fn();

    await handleHelloJob({ message: 'test', runId: 'run-1' }, spy);

    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith({ message: 'test', runId: 'run-1' });
  });

  it('enqueue accepts job payload and calls inngest.send', async () => {
    const { inngest } = await import('@/lib/inngest/client');
    const sendSpy = vi.spyOn(inngest, 'send').mockResolvedValue({ ids: ['evt-1'] });

    const result = await helloModule.enqueueHelloJob({ message: 'queued' });

    expect(sendSpy).toHaveBeenCalledWith({
      name: 'app/hello',
      data: { message: 'queued' },
    });
    expect(result.ids).toEqual(['evt-1']);
  });
});
