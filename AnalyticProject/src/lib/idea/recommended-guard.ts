import { applyRecommendedFilter } from '@/domain/scoring';

import type { IdeaListRecord } from './serialize';

/** Defense in depth: DB status=recommended must still pass 4 thresholds. */
export function passesRecommendedGuard(row: IdeaListRecord): boolean {
  if (
    row.oneJobScore == null ||
    row.aiBuildabilityScore == null ||
    row.firstSalePotential == null ||
    row.estimatedBuildDays == null
  ) {
    return false;
  }

  const result = applyRecommendedFilter({
    oneJobScore: row.oneJobScore,
    aiBuildabilityScore: row.aiBuildabilityScore,
    firstSalePotential: row.firstSalePotential,
    estimatedBuildDays: row.estimatedBuildDays,
    oneJobTemplate: row.oneJobTemplate,
  });

  return result.status === 'recommended';
}
