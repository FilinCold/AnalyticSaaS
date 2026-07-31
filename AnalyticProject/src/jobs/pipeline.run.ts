import { inngest } from '@/lib/inngest/client';
import { createLlmProvider } from '@/lib/llm';
import { prisma as defaultPrisma } from '@/lib/prisma';
import {
  toUserSafePipelineError,
} from '@/domain/pipeline/errors';
import type { PipelineTrigger } from '@/domain/types';

import { stepCluster } from './pipeline/steps/cluster';
import { stepDraft } from './pipeline/steps/draft';
import { stepEstimate } from './pipeline/steps/estimate';
import { stepExtract } from './pipeline/steps/extract';
import { stepFinish } from './pipeline/steps/finish';
import { stepIngest } from './pipeline/steps/ingest';
import { stepNormalize } from './pipeline/steps/normalize';
import { stepFilter, stepScore } from './pipeline/steps/score';
import type {
  PipelineContext,
  PipelineDeps,
  PipelineRunPayload,
  PipelineStepName,
} from './pipeline/types';

export type { PipelineDeps, PipelineRunPayload, PipelineStepName };

async function cleanupPreviousIdeas(
  prisma: PipelineContext['prisma'],
  researchId: string,
): Promise<void> {
  // New run: delete previous candidate/excluded; keep recommended until finish overwrites
  await prisma.idea.deleteMany({
    where: {
      researchId,
      status: { in: ['candidate', 'excluded'] },
    },
  });
}

async function runStep(
  ctx: PipelineContext,
  name: PipelineStepName,
  fn: () => Promise<void>,
): Promise<void> {
  await ctx.prisma.pipelineRun.update({
    where: { id: ctx.pipelineRunId },
    data: { currentStep: name },
  });

  try {
    await fn();
  } catch (err) {
    const message = toUserSafePipelineError(err);
    await ctx.prisma.pipelineRun.update({
      where: { id: ctx.pipelineRunId },
      data: {
        status: 'failed',
        error: message,
        finishedAt: new Date(),
        currentStep: name,
      },
    });
    throw err;
  }
}

/**
 * Direct pipeline execution (tests + Inngest handler).
 * Marks run running → steps → succeeded|failed.
 */
export async function executePipelineRun(
  payload: PipelineRunPayload,
  deps: PipelineDeps = {},
): Promise<void> {
  const prisma = deps.prisma ?? defaultPrisma;
  const llm = deps.llm ?? createLlmProvider();

  await prisma.pipelineRun.update({
    where: { id: payload.pipelineRunId },
    data: {
      status: 'running',
      currentStep: 'ingest',
      error: null,
      finishedAt: null,
    },
  });

  const ctx: PipelineContext = {
    ...payload,
    prisma,
    llm,
    ingestSignals: deps.ingestSignals,
    clusterIdMap: new Map(),
    candidateIdeaIds: [],
    narrowingAppliedByIdeaId: new Map(),
  };

  try {
    await cleanupPreviousIdeas(prisma, payload.researchId);

    let extractResult: Awaited<ReturnType<typeof stepExtract>> | null = null;

    await runStep(ctx, 'ingest', () => stepIngest(ctx));
    await runStep(ctx, 'normalize', () => stepNormalize(ctx));
    await runStep(ctx, 'extract', async () => {
      extractResult = await stepExtract(ctx);
    });
    await runStep(ctx, 'cluster', async () => {
      if (!extractResult) {
        throw new Error('extract result missing');
      }
      await stepCluster(ctx, extractResult);
    });
    await runStep(ctx, 'draft', () => stepDraft(ctx));
    await runStep(ctx, 'estimate', () => stepEstimate(ctx));
    await runStep(ctx, 'score', () => stepScore(ctx));
    await runStep(ctx, 'filter', () => stepFilter());
    await runStep(ctx, 'finish', () => stepFinish(ctx));
  } catch {
    // Failure already persisted in runStep
  }
}

export type PipelineJobPayload = {
  researchId: string;
  pipelineRunId: string;
  trigger: PipelineTrigger;
};

export const pipelineRunJob = inngest.createFunction(
  {
    id: 'pipeline-run',
    triggers: [{ event: 'pipeline/run' }],
  },
  async ({ event }) => {
    const data = event.data as PipelineJobPayload;
    await executePipelineRun({
      researchId: data.researchId,
      pipelineRunId: data.pipelineRunId,
      trigger: data.trigger,
    });
  },
);

export async function enqueuePipelineRun(payload: PipelineJobPayload) {
  return inngest.send({
    name: 'pipeline/run',
    data: payload,
  });
}
