import { withLlmRetry } from '@/domain/pipeline/llm-retry';
import { PipelineStepError } from '@/domain/pipeline/errors';
import {
  applyRecommendedFilter,
  computeAIBuildabilityScore,
  computeFirstSalePotential,
  computeOneJobScore,
  computeOpportunityScore,
  computeTimeFitScore,
} from '@/domain/scoring';
import { scoreBreakdownResultSchema } from '@/lib/llm';
import { SCORE_BREAKDOWN_SYSTEM } from '@/lib/llm/prompts';
import type { Prisma } from '@prisma/client';

import type { PipelineContext } from '../types';

export async function stepScore(ctx: PipelineContext): Promise<void> {
  if (ctx.candidateIdeaIds.length === 0) {
    throw new PipelineStepError('Нет идей для score.');
  }

  for (const ideaId of ctx.candidateIdeaIds) {
    const idea = await ctx.prisma.idea.findUniqueOrThrow({
      where: { id: ideaId },
    });

    // Already hard-excluded at estimate (exceeds 14 after narrow)
    if (
      idea.status === 'excluded' &&
      Array.isArray(idea.exclusionReasons) &&
      (idea.exclusionReasons as string[]).includes('exceeds_14_days') &&
      idea.estimatedBuildDays != null &&
      idea.estimatedBuildDays > 14
    ) {
      continue;
    }

    const breakdown = await withLlmRetry(() =>
      ctx.llm.completeStructured({
        schema: scoreBreakdownResultSchema,
        system: SCORE_BREAKDOWN_SYSTEM,
        user: JSON.stringify({
          oneJobTemplate: idea.oneJobTemplate,
          primaryUser: idea.primaryUser,
          problem: idea.problem,
          estimatedBuildDays: idea.estimatedBuildDays,
        }),
        fixture: 'score-breakdown-recommended',
        schemaName: 'ScoreBreakdownResult',
      }),
    );

    const templateFilled = Boolean(idea.oneJobTemplate?.trim());
    const oneJobScore = computeOneJobScore(breakdown.oneJob, {
      oneJobTemplateFilled: templateFilled,
    });
    const aiBuildabilityScore = computeAIBuildabilityScore(
      breakdown.aiBuildability,
    );
    const firstSalePotential = computeFirstSalePotential(breakdown.firstSale);
    const estimatedBuildDays = idea.estimatedBuildDays ?? 99;
    const timeFit = computeTimeFitScore(estimatedBuildDays);
    const opportunityScore = computeOpportunityScore({
      oneJobScore,
      aiBuildabilityScore,
      firstSalePotential,
      timeFitScore: timeFit,
    });

    const narrowingApplied =
      ctx.narrowingAppliedByIdeaId.get(ideaId) === true;

    const filtered = applyRecommendedFilter({
      oneJobScore,
      aiBuildabilityScore,
      firstSalePotential,
      estimatedBuildDays,
      oneJobTemplate: idea.oneJobTemplate,
      narrowingApplied,
    });

    await ctx.prisma.idea.update({
      where: { id: ideaId },
      data: {
        oneJobScore,
        aiBuildabilityScore,
        firstSalePotential,
        opportunityScore,
        scoreBreakdown: breakdown as unknown as Prisma.InputJsonValue,
        status: filtered.status,
        exclusionReasons: filtered.exclusionReasons as Prisma.InputJsonValue,
      },
    });
  }
}

/** filter step is merged into score (status written there); keep no-op for step list clarity */
export async function stepFilter(): Promise<void> {
  // Status already set in stepScore via applyRecommendedFilter
}
