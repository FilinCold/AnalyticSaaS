/**
 * Scoring domain — pure int-score formulas.
 * SSOT: docs/AI_PIPELINE.md
 */

export type {
  AIBuildabilityCriteria,
  CriterionScore,
  ExclusionReason,
  FilterInput,
  FilterResult,
  FirstSaleInput,
  FirstSaleNegatives,
  FirstSalePositives,
  IdeaStatus,
  OneJobCriteria,
  ScoreBreakdown,
} from './types';

export { computeOneJobScore } from './oneJob';
export type { OneJobOptions } from './oneJob';
export { computeAIBuildabilityScore } from './aiBuildability';
export { computeFirstSalePotential } from './firstSale';
export { computeTimeFitScore } from './timeFit';
export { computeOpportunityScore } from './opportunity';
export type { OpportunityInput } from './opportunity';
export { applyRecommendedFilter } from './filter';
export {
  applyNarrowing,
  DAYS_PER_EXCLUDED_FEATURE,
  MANUAL_FALLBACK_DAYS,
  MAX_BUILD_DAYS,
} from './narrowing';
export type { NarrowingInput, NarrowingResult } from './narrowing';