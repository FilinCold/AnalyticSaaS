import { describe, expect, it } from 'vitest';

import {
  hashPassword,
  isValidEmail,
  isValidPassword,
  verifyPassword,
} from '@/lib/auth/password';

describe('auth password helpers', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('secret123');

    expect(hash).not.toContain('secret123');
    expect(await verifyPassword('secret123', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('validates email and password rules', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('bad')).toBe(false);
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('short')).toBe(false);
  });
});
