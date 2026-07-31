import { withLlmRetry } from '@/domain/pipeline/llm-retry';
import { PipelineStepError } from '@/domain/pipeline/errors';
import {
  draftIdeasResultSchema,
  salesBlockResultSchema,
} from '@/lib/llm';
import { DRAFT_IDEAS_SYSTEM, SALES_BLOCK_SYSTEM } from '@/lib/llm/prompts';
import type { Prisma } from '@prisma/client';

import type { PipelineContext } from '../types';

function resolveClusterIds(
  fixtureIds: string[],
  map: Map<string, string>,
  fallbackIds: string[],
): string[] {
  const resolved = fixtureIds
    .map((id) => map.get(id))
    .filter((id): id is string => Boolean(id));
  if (resolved.length > 0) return resolved;
  return fallbackIds.slice(0, 1);
}

/** One LLM draft_ideas call for all clusters, then sales_block per idea. */
export async function stepDraft(ctx: PipelineContext): Promise<void> {
  const research = await ctx.prisma.research.findUniqueOrThrow({
    where: { id: ctx.researchId },
    select: { topic: true, keywords: true },
  });

  const clusters = await ctx.prisma.painCluster.findMany({
    where: { researchId: ctx.researchId },
  });
  if (clusters.length === 0) {
    throw new PipelineStepError('Нет кластеров для draft_ideas.');
  }

  const clusterIds = clusters.map((c) => c.id);

  const draft = await withLlmRetry(() =>
    ctx.llm.completeStructured({
      schema: draftIdeasResultSchema,
      system: DRAFT_IDEAS_SYSTEM,
      user: JSON.stringify({
        topic: research.topic,
        keywords: research.keywords,
        clusters: clusters.map((c) => ({
          id: c.id,
          label: c.label,
          summary: c.summary,
          signalIds: c.signalIds,
        })),
      }),
      fixture: 'draft-ideas-recommended',
      schemaName: 'DraftIdeasResult',
    }),
  );

  if (draft.ideas.length === 0) {
    throw new PipelineStepError('LLM не вернул идеи (draft_ideas пустой).');
  }

  ctx.candidateIdeaIds.length = 0;

  for (const idea of draft.ideas) {
    const supportingClusterIds = resolveClusterIds(
      idea.clusterIds,
      ctx.clusterIdMap,
      clusterIds,
    );

    const supportingSignalIds = new Set<string>();
    for (const cluster of clusters) {
      if (!supportingClusterIds.includes(cluster.id)) continue;
      const ids = Array.isArray(cluster.signalIds)
        ? (cluster.signalIds as unknown[])
        : [];
      for (const id of ids) {
        if (typeof id === 'string') supportingSignalIds.add(id);
      }
    }

    const sales = await withLlmRetry(() =>
      ctx.llm.completeStructured({
        schema: salesBlockResultSchema,
        system: SALES_BLOCK_SYSTEM,
        user: JSON.stringify({ idea }),
        fixture: 'sales-block',
        schemaName: 'SalesBlockResult',
      }),
    );

    const row = await ctx.prisma.idea.create({
      data: {
        researchId: ctx.researchId,
        status: 'candidate',
        primaryUser: idea.primaryUser,
        problem: idea.problem,
        inputDataType: idea.inputDataType,
        mainAction: idea.mainAction,
        concreteResult: idea.concreteResult,
        payReason: idea.payReason,
        oneJobTemplate: idea.oneJobTemplate,
        supportingClusterIds: supportingClusterIds as Prisma.InputJsonValue,
        supportingSignalIds: [...supportingSignalIds] as Prisma.InputJsonValue,
        firstCustomerPersona: sales.firstCustomerPersona,
        whereToFindCustomers: sales.whereToFindCustomers,
        painStatement: sales.painStatement,
        shortOffer: sales.shortOffer,
        primaryAcquisitionChannel: sales.primaryAcquisitionChannel,
        howToShowResult: sales.howToShowResult,
        recommendedCta: sales.recommendedCta,
        simplePrice: sales.simplePrice,
        howToGetFirstPayment: sales.howToGetFirstPayment,
        continueCriteria: sales.continueCriteria,
        stopCriteria: sales.stopCriteria,
      },
    });
    ctx.candidateIdeaIds.push(row.id);
  }
}
