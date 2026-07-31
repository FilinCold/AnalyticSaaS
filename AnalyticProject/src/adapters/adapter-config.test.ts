import { describe, expect, it } from 'vitest';

import { productHuntAdapter } from '@/adapters/producthunt';
import { redditAdapter } from '@/adapters/reddit';
import { AdapterConfigError } from '@/adapters/types';

describe('live adapters without API keys', () => {
  it('Product Hunt throws AdapterConfigError', async () => {
    const prev = process.env.PRODUCTHUNT_API_TOKEN;
    delete process.env.PRODUCTHUNT_API_TOKEN;

    await expect(
      productHuntAdapter.fetchSignals({ topic: 'saas', keywords: [] }),
    ).rejects.toBeInstanceOf(AdapterConfigError);

    if (prev !== undefined) process.env.PRODUCTHUNT_API_TOKEN = prev;
  });

  it('Reddit throws AdapterConfigError', async () => {
    const prevId = process.env.REDDIT_CLIENT_ID;
    const prevSecret = process.env.REDDIT_CLIENT_SECRET;
    delete process.env.REDDIT_CLIENT_ID;
    delete process.env.REDDIT_CLIENT_SECRET;

    await expect(
      redditAdapter.fetchSignals({ topic: 'saas', keywords: [] }),
    ).rejects.toBeInstanceOf(AdapterConfigError);

    if (prevId !== undefined) process.env.REDDIT_CLIENT_ID = prevId;
    if (prevSecret !== undefined) process.env.REDDIT_CLIENT_SECRET = prevSecret;
  });
});
