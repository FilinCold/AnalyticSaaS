import type { OneJobCriteria } from './types';

export type OneJobOptions = {
  oneJobTemplateFilled?: boolean;
};

function avgRound(values: number[]): number {
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/** OneJobScore = round(avg(criteria_1..8)); hard gate caps at 59 if template empty. */
export function computeOneJobScore(
  criteria: OneJobCriteria,
  options?: OneJobOptions,
): number {
  const score = avgRound([
    criteria.explainableInOneSentence,
    criteria.singlePrimaryUser,
    criteria.singleProblem,
    criteria.singleMainScenario,
    criteria.singleClearResult,
    criteria.valueOnOneExample,
    criteria.singleOfferLanding,
    criteria.canDropSecondaryWithoutLosingValue,
  ]);

  if (options?.oneJobTemplateFilled === false) {
    return Math.min(score, 59);
  }

  return score;
}
