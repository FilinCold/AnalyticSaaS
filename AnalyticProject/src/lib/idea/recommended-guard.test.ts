import { describe, expect, it } from 'vitest';

import { passesRecommendedGuard } from '@/lib/idea/recommended-guard';

describe('passesRecommendedGuard', () => {
  const ok = {
    id: '1',
    status: 'recommended',
    problem: 'p',
    oneJobTemplate: 'For X who Y',
    oneJobScore: 80,
    aiBuildabilityScore: 75,
    firstSalePotential: 70,
    estimatedBuildDays: 14,
    opportunityScore: 80,
    exclusionReasons: [],
  };

  it('passes at exact thresholds', () => {
    expect(passesRecommendedGuard(ok)).toBe(true);
  });

  it('rejects below oneJob', () => {
    expect(passesRecommendedGuard({ ...ok, oneJobScore: 79 })).toBe(false);
  });

  it('rejects null scores', () => {
    expect(passesRecommendedGuard({ ...ok, oneJobScore: null })).toBe(false);
  });

  it('rejects empty template', () => {
    expect(passesRecommendedGuard({ ...ok, oneJobTemplate: '  ' })).toBe(false);
  });
});
