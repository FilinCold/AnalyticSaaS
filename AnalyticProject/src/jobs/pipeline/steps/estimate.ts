import { withLlmRetry } from '@/domain/pipeline/llm-retry';
import { PipelineStepError } from '@/domain/pipeline/errors';
import { applyNarrowing, MAX_BUILD_DAYS } from '@/domain/scoring';
import { estimateBuildResultSchema } from '@/lib/llm';
import { ESTIMATE_BUILD_SYSTEM } from '@/lib/llm/prompts';
import type { Prisma } from '@prisma/client';

import type { PipelineContext } from '../types';

export async function stepEstimate(ctx: PipelineContext): Promise<void> {
  if (ctx.candidateIdeaIds.length === 0) {
    throw new PipelineStepError('Нет candidate идей для estimate_build.');
  }

  for (const ideaId of ctx.candidateIdeaIds) {
    const idea = await ctx.prisma.idea.findUniqueOrThrow({
      where: { id: ideaId },
    });

    const estimate = await withLlmRetry(() =>
      ctx.llm.completeStructured({
        schema: estimateBuildResultSchema,
        system: ESTIMATE_BUILD_SYSTEM,
        user: JSON.stringify({
          primaryUser: idea.primaryUser,
          problem: idea.problem,
          oneJobTemplate: idea.oneJobTemplate,
          mainAction: idea.mainAction,
        }),
        fixture: 'estimate-build',
        schemaName: 'EstimateBuildResult',
      }),
    );

    let estimatedBuildDays = estimate.estimatedBuildDays;
    let featuresExcluded = [...estimate.featuresExcludedToFitDeadline];
    let narrowingApplied = estimate.narrowingApplied;
    let hardExcluded = false;

    if (estimatedBuildDays > MAX_BUILD_DAYS) {
      const secondary =
        estimate.requiredIntegrations.length > 0
          ? estimate.requiredIntegrations
          : ['secondary feature'];

      const narrowed = applyNarrowing({
        estimatedBuildDays,
        secondaryFeatures: secondary,
        featuresAlreadyExcluded: featuresExcluded,
        canManualFallback: true,
      });

      if (narrowed.action === 'exclude') {
        hardExcluded = true;
        featuresExcluded = [...new Set([...featuresExcluded, ...secondary])];
      } else if (narrowed.action === 'narrowed') {
        estimatedBuildDays = narrowed.estimatedBuildDays;
        featuresExcluded = narrowed.featuresExcluded;
        narrowingApplied = true;
      } else {
        estimatedBuildDays = narrowed.estimatedBuildDays;
        featuresExcluded = narrowed.featuresExcluded;
      }
    }

    ctx.narrowingAppliedByIdeaId.set(ideaId, narrowingApplied);

    await ctx.prisma.idea.update({
      where: { id: ideaId },
      data: {
        estimatedBuildDays,
        buildTimeConfidence: estimate.buildTimeConfidence,
        fourteenDayBuildPlan:
          estimate.fourteenDayBuildPlan as Prisma.InputJsonValue,
        featuresExcludedToFitDeadline: featuresExcluded as Prisma.InputJsonValue,
        riskOfDeveloperHelp: estimate.riskOfDeveloperHelp,
        requiredIntegrations:
          estimate.requiredIntegrations as Prisma.InputJsonValue,
        mainTechnicalRisk: estimate.mainTechnicalRisk,
        status: hardExcluded ? 'excluded' : 'candidate',
        exclusionReasons: hardExcluded
          ? (['exceeds_14_days'] as Prisma.InputJsonValue)
          : [],
      },
    });
  }
}
