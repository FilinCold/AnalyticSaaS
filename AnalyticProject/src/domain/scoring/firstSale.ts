import type { FirstSaleInput, FirstSaleNegatives } from './types';

const NEGATIVE_KEYS: (keyof FirstSaleNegatives)[] = [
  'longEnterpriseCycle',
  'multiPersonDecision',
  'requiresImplementation',
  'needsPersonalOnboarding',
  'valueAppearsInMonths',
  'highPriceNeedsApproval',
  'audienceHardToFind',
  'needsLargeUserBaseFirst',
];

/**
 * raw = avg(positive_1..10)
 * FirstSalePotential = round(max(0, raw - 8 * count(true_negatives)))
 */
export function computeFirstSalePotential(input: FirstSaleInput): number {
  const positives: number[] = [
    input.audienceConcentrated,
    input.buyerIsDecisionMaker,
    input.noLongApproval,
    input.shortSalesCycle,
    input.valueImmediate,
    input.demoInMinutes,
    input.dmOrSmallAdsStart,
    input.noBrandRequired,
    input.selfServiceOk,
    input.paymentRightAfterLaunch,
  ];
  const raw = positives.reduce((sum, v) => sum + v, 0) / positives.length;
  const trueNegatives = NEGATIVE_KEYS.filter((key) => input.negatives[key]).length;
  return Math.round(Math.max(0, raw - 8 * trueNegatives));
}
