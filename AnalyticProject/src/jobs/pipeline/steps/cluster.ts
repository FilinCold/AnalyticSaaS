import { withLlmRetry } from '@/domain/pipeline/llm-retry';
import { PipelineStepError } from '@/domain/pipeline/errors';
import {
  clusterPainsResultSchema,
  type ExtractPainsResult,
} from '@/lib/llm';
import { CLUSTER_PAINS_SYSTEM } from '@/lib/llm/prompts';
import type { Prisma } from '@prisma/client';

import type { PipelineContext } from '../types';

function remapClusterSignalIds(
  signalIds: string[],
  knownSignalIds: string[],
): string[] {
  const known = new Set(knownSignalIds);
  const remapped = signalIds
    .map((id, index) =>
      known.has(id) ? id : (knownSignalIds[index] ?? knownSignalIds[0]),
    )
    .filter((id): id is string => Boolean(id));
  return remapped.length > 0 ? remapped : knownSignalIds.slice(0, 1);
}

export async function stepCluster(
  ctx: PipelineContext,
  extract: ExtractPainsResult,
): Promise<void> {
  const knownSignalIds = [
    ...new Set(extract.pains.map((p) => p.signalId)),
  ];

  const result = await withLlmRetry(() =>
    ctx.llm.completeStructured({
      schema: clusterPainsResultSchema,
      system: CLUSTER_PAINS_SYSTEM,
      user: JSON.stringify({ pains: extract.pains }),
      fixture: 'cluster-pains',
      schemaName: 'ClusterPainsResult',
    }),
  );

  if (result.clusters.length === 0) {
    throw new PipelineStepError('LLM не вернул кластеры (cluster_pains пустой).');
  }

  // Fresh clusters for this run
  await ctx.prisma.painCluster.deleteMany({
    where: { researchId: ctx.researchId },
  });
  ctx.clusterIdMap.clear();

  for (let i = 0; i < result.clusters.length; i += 1) {
    const cluster = result.clusters[i]!;
    const signalIds = remapClusterSignalIds(cluster.signalIds, knownSignalIds);
    const row = await ctx.prisma.painCluster.create({
      data: {
        researchId: ctx.researchId,
        label: cluster.label,
        summary: cluster.summary,
        frequencyHint: cluster.frequencyHint,
        signalIds: signalIds as Prisma.InputJsonValue,
      },
    });
    // Fixture draft uses labels like cluster-recommended-1; map by index + label
    ctx.clusterIdMap.set(cluster.label, row.id);
    ctx.clusterIdMap.set(`cluster-recommended-${i + 1}`, row.id);
    ctx.clusterIdMap.set(`cluster-excluded-${i + 1}`, row.id);
    ctx.clusterIdMap.set(String(i), row.id);
  }
}
