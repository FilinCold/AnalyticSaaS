import { describe, expect, it } from 'vitest';

import { normalizeSignalText } from '@/domain/pipeline/normalize-text';

describe('normalizeSignalText', () => {
  it('trims, strips HTML, collapses whitespace', () => {
    expect(normalizeSignalText('  hello   <b>world</b>\n\t!  ')).toBe(
      'hello world !',
    );
  });

  it('caps at 50000 chars', () => {
    const long = 'a'.repeat(60_000);
    expect(normalizeSignalText(long).length).toBe(50_000);
  });
});
