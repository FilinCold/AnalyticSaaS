import { hackerNewsAdapter } from './hackernews';
import { createMockAdapter } from './mock';
import { productHuntAdapter } from './producthunt';
import { redditAdapter } from './reddit';
import type { SourceAdapter } from './types';

export type { AdapterSourceType, IngestSignal, SourceAdapter } from './types';
export { AdapterConfigError } from './types';
export { createMockAdapter } from './mock';

export function getAdapterMode(): 'mock' | 'live' {
  return process.env.ADAPTER_MODE === 'live' ? 'live' : 'mock';
}

/** Mock by default (safe for tests/dev). Live: HN + PH + Reddit. */
export function getAdapters(): SourceAdapter[] {
  if (getAdapterMode() === 'mock') {
    return [
      createMockAdapter('hackernews', 2),
      createMockAdapter('producthunt', 2),
      createMockAdapter('reddit', 2),
    ];
  }

  return [hackerNewsAdapter, productHuntAdapter, redditAdapter];
}
