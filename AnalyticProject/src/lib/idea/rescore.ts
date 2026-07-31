import {
  applyRecommendedFilter,
  computeOpportunityScore,
  computeTimeFitScore,
  DAYS_PER_EXCLUDED_FEATURE,
} from '@/domain/scoring';
import type { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * MVP heuristic (no LLM): reconstruct pre-exclusion baseline from current
 * days + previous exclusions, then subtract 2 days per next exclusion.
 * SSOT: docs/BACKGROUND_JOBS.md idea.rescore · F4-02 DAYS_PER_EXCLUDED_FEATURE
 */
export function reestimateBuildDays(input: {
  currentEstimatedBuildDays: number;
  previousExcluded: string[];
  nextExcluded: string[];
}): number {
  const baseline =
    input.currentEstimatedBuildDays +
    DAYS_PER_EXCLUDED_FEATURE * input.previousExcluded.length;
  return Math.max(
    1,
    baseline - DAYS_PER_EXCLUDED_FEATURE * input.nextExcluded.length,
  );
}

export type RescoreDeps = {
  prisma: Pick<PrismaClient, 'idea'>;
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

/**
 * Light rescore for one idea: keep OneJob/AI/FirstSale scores, refresh
 * TimeFit → Opportunity + recommended filter. Does not touch other ideas.
 */
export async function executeIdeaRescore(
  ideaId: string,
  deps: RescoreDeps,
): Promise<{
  id: string;
  status: string;
  estimatedBuildDays: number | null;
  opportunityScore: number | null;
  exclusionReasons: unknown;
}> {
  const idea = await deps.prisma.idea.findUniqueOrThrow({
    where: { id: ideaId },
  });

  const featuresExcluded = asStringArray(idea.featuresExcludedToFitDeadline);
  const estimatedBuildDays = idea.estimatedBuildDays ?? 99;
  const oneJobScore = idea.oneJobScore ?? 0;
  const aiBuildabilityScore = idea.aiBuildabilityScore ?? 0;
  const firstSalePotential = idea.firstSalePotential ?? 0;

  const timeFitScore = computeTimeFitScore(estimatedBuildDays);
  const opportunityScore = computeOpportunityScore({
    oneJobScore,
    aiBuildabilityScore,
    firstSalePotential,
    timeFitScore,
  });

  const narrowingApplied =
    featuresExcluded.length > 0 ||
    idea.status === 'narrowed' ||
    idea.status === 'recommended';

  const filtered = applyRecommendedFilter({
    oneJobScore,
    aiBuildabilityScore,
    firstSalePotential,
    estimatedBuildDays,
    oneJobTemplate: idea.oneJobTemplate,
    narrowingApplied,
  });

  const updated = await deps.prisma.idea.update({
    where: { id: ideaId },
    data: {
      opportunityScore,
      status: filtered.status,
      exclusionReasons: filtered.exclusionReasons as Prisma.InputJsonValue,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    estimatedBuildDays: updated.estimatedBuildDays,
    opportunityScore: updated.opportunityScore,
    exclusionReasons: updated.exclusionReasons,
  };
}
