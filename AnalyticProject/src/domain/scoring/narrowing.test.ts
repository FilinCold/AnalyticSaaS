/**
 * F4-02 Narrowing helper — SSOT: docs/AI_PIPELINE.md § Сужение
 * Часть 4: if days > 14 → drop secondary → re-estimate; still >14 → exclude exceeds_14_days.
 */
import { describe, expect, it } from 'vitest';

import { applyNarrowing } from '@/domain/scoring/narrowing';

describe('applyNarrowing', () => {
  // T1 — within deadline: no narrowing
  it('T1: days=12 → action=ok', () => {
    const result = applyNarrowing({
      estimatedBuildDays: 12,
      secondaryFeatures: ['export', 'webhooks'],
      featuresAlreadyExcluded: [],
      canManualFallback: false,
    });
    expect(result).toEqual({
      action: 'ok',
      estimatedBuildDays: 12,
      featuresExcluded: [],
    });
  });

  // T2 — drop secondary → days ≤ 14
  it('T2: days=16 + 2 secondary → narrowed, days≤14', () => {
    const result = applyNarrowing({
      estimatedBuildDays: 16,
      secondaryFeatures: ['export', 'webhooks'],
      featuresAlreadyExcluded: [],
      canManualFallback: false,
    });
    expect(result.action).toBe('narrowed');
    if (result.action === 'narrowed') {
      expect(result.estimatedBuildDays).toBeLessThanOrEqual(14);
      expect(result.estimatedBuildDays).toBe(12); // 16 - 2*2
      expect(result.featuresExcluded).toEqual(['export', 'webhooks']);
    }
  });

  // T3 — no room to cut
  it('T3: days=20, no secondary → exclude exceeds_14_days', () => {
    const result = applyNarrowing({
      estimatedBuildDays: 20,
      secondaryFeatures: [],
      featuresAlreadyExcluded: [],
      canManualFallback: false,
    });
    expect(result).toEqual({
      action: 'exclude',
      reason: 'exceeds_14_days',
    });
  });

  // T4 — already excluded not duplicated
  it('T4: Duplicate exclude → no dup in array', () => {
    const result = applyNarrowing({
      estimatedBuildDays: 16,
      secondaryFeatures: ['export', 'webhooks'],
      featuresAlreadyExcluded: ['export'],
      canManualFallback: false,
    });
    expect(result.action).toBe('narrowed');
    if (result.action === 'narrowed') {
      expect(result.featuresExcluded).toEqual(['export', 'webhooks']);
      expect(new Set(result.featuresExcluded).size).toBe(
        result.featuresExcluded.length,
      );
      // only 1 new exclusion → 16 - 2 = 14
      expect(result.estimatedBuildDays).toBe(14);
    }
  });

  it('manual fallback −2 once when secondary not enough', () => {
    const result = applyNarrowing({
      estimatedBuildDays: 18,
      secondaryFeatures: ['export'],
      featuresAlreadyExcluded: [],
      canManualFallback: true,
    });
    // 18 - 2 (export) = 16; then −2 manual → 14
    expect(result).toEqual({
      action: 'narrowed',
      estimatedBuildDays: 14,
      featuresExcluded: ['export'],
    });
  });

  it('still exclude when fallback cannot reach ≤14', () => {
    const result = applyNarrowing({
      estimatedBuildDays: 20,
      secondaryFeatures: [],
      featuresAlreadyExcluded: [],
      canManualFallback: true,
    });
    // 20 − 2 manual = 18 > 14
    expect(result).toEqual({
      action: 'exclude',
      reason: 'exceeds_14_days',
    });
  });
});
