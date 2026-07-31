import { describe, expect, it, vi } from 'vitest';

import { withLlmRetry } from '@/domain/pipeline/llm-retry';
import { LlmRetriableError } from '@/lib/llm';

describe('withLlmRetry', () => {
  it('T3: retries once on LlmRetriableError then succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new LlmRetriableError('bad json'))
      .mockResolvedValueOnce({ ok: true });

    await expect(withLlmRetry(fn)).resolves.toEqual({ ok: true });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('T3: fails after second LlmRetriableError', async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new LlmRetriableError('still bad'));

    await expect(withLlmRetry(fn)).rejects.toBeInstanceOf(LlmRetriableError);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-retriable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(withLlmRetry(fn)).rejects.toThrow('boom');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
