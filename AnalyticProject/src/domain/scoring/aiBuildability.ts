import type { AIBuildabilityCriteria } from './types';

/** AIBuildabilityScore = round(avg(criteria_1..11)) */
export function computeAIBuildabilityScore(
  criteria: AIBuildabilityCriteria,
): number {
  const values: number[] = [
    criteria.typicalArchitecture,
    criteria.lowNonStandardCode,
    criteria.goodServiceDocs,
    criteria.fewIntegrations,
    criteria.officialApisAvailable,
    criteria.visuallyVerifiable,
    criteria.easyErrorDiagnosis,
    criteria.simpleDeploy,
    criteria.managedServicesOk,
    criteria.incrementalBuildPossible,
    criteria.manualFallbackPossible,
  ];
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}
