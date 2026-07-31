/**
 * Deterministic MVP narrowing — SSOT: docs/AI_PIPELINE.md § Сужение
 *
 * Heuristic (documented): each newly excluded secondary feature saves
 * DAYS_PER_EXCLUDED_FEATURE days; optional manual fallback saves
 * MANUAL_FALLBACK_DAYS once. Deadline = MAX_BUILD_DAYS.
 */

export const MAX_BUILD_DAYS = 14;
/** MVP: dropping one secondary feature ≈ −2 build days */
export const DAYS_PER_EXCLUDED_FEATURE = 2;
/** MVP: replace automation with manual step ≈ −2 days (once) */
export const MANUAL_FALLBACK_DAYS = 2;

export type NarrowingInput = {
  estimatedBuildDays: number;
  secondaryFeatures: string[];
  featuresAlreadyExcluded: string[];
  canManualFallback: boolean;
};

export type NarrowingResult =
  | {
      action: 'ok';
      estimatedBuildDays: number;
      featuresExcluded: string[];
    }
  | {
      action: 'narrowed';
      estimatedBuildDays: number;
      featuresExcluded: string[];
    }
  | { action: 'exclude'; reason: 'exceeds_14_days' };

export function applyNarrowing(input: NarrowingInput): NarrowingResult {
  const already = [...input.featuresAlreadyExcluded];

  if (input.estimatedBuildDays <= MAX_BUILD_DAYS) {
    return {
      action: 'ok',
      estimatedBuildDays: input.estimatedBuildDays,
      featuresExcluded: already,
    };
  }

  const alreadySet = new Set(already);
  const newlyExcluded: string[] = [];
  for (const feature of input.secondaryFeatures) {
    if (!alreadySet.has(feature)) {
      newlyExcluded.push(feature);
      alreadySet.add(feature);
    }
  }

  const featuresExcluded = [...already, ...newlyExcluded];
  let days =
    input.estimatedBuildDays -
    DAYS_PER_EXCLUDED_FEATURE * newlyExcluded.length;

  if (days <= MAX_BUILD_DAYS) {
    return {
      action: 'narrowed',
      estimatedBuildDays: days,
      featuresExcluded,
    };
  }

  if (input.canManualFallback) {
    days -= MANUAL_FALLBACK_DAYS;
    if (days <= MAX_BUILD_DAYS) {
      return {
        action: 'narrowed',
        estimatedBuildDays: days,
        featuresExcluded,
      };
    }
  }

  return { action: 'exclude', reason: 'exceeds_14_days' };
}
