import { describe, expect, it } from 'vitest';

import { parseKeywords } from '@/lib/research/keywords';

describe('research form keywords', () => {
  it('splits comma-separated keywords', () => {
    expect(parseKeywords('saas, b2b, niche')).toEqual(['saas', 'b2b', 'niche']);
  });

  it('trims and drops empty parts', () => {
    expect(parseKeywords('  a , , b  ')).toEqual(['a', 'b']);
  });

  it('returns empty array for blank input', () => {
    expect(parseKeywords('')).toEqual([]);
    expect(parseKeywords('   ')).toEqual([]);
  });
});
