export type OpportunityInput = {
  oneJobScore: number;
  aiBuildabilityScore: number;
  firstSalePotential: number;
  timeFitScore: number;
};

/**
 * OpportunityScore = round(
 *   0.30 * OneJob + 0.25 * AI + 0.30 * FirstSale + 0.15 * TimeFit
 * )
 */
export function computeOpportunityScore(input: OpportunityInput): number {
  return Math.round(
    0.3 * input.oneJobScore +
      0.25 * input.aiBuildabilityScore +
      0.3 * input.firstSalePotential +
      0.15 * input.timeFitScore,
  );
}
