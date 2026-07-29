import { describe, expect, it } from 'vitest';

import { APP_NAME } from '@/lib/index';

describe('smoke', () => {
  it('resolves @/ alias and lib export', () => {
    expect(APP_NAME).toBe('analytic-project');
  });
});
