import type { PrismaClient } from '@prisma/client';

import type { PipelineTrigger } from '@/domain/types';
import type { LlmProvider } from '@/lib/llm';

/** current_step values — SSOT: F5-03 STEP.md */
export type PipelineStepName =
  | 'ingest'
  | 'normalize'
  | 'extract'
  | 'cluster'
  | 'draft'
  | 'estimate'
  | 'score'
  | 'filter'
  | 'finish';

export type PipelineRunPayload = {
  researchId: string;
  pipelineRunId: string;
  trigger: PipelineTrigger;
};

export type PipelineDeps = {
  prisma?: PrismaClient;
  llm?: LlmProvider;
  /** Override ingest (tests); default uses adapters when trigger warrants */
  ingestSignals?: (researchId: string) => Promise<void>;
};

export type PipelineContext = PipelineRunPayload & {
  prisma: PrismaClient;
  llm: LlmProvider;
  ingestSignals?: (researchId: string) => Promise<void>;
  /** cluster fixture id → persisted PainCluster id */
  clusterIdMap: Map<string, string>;
  /** idea ids created this run (candidate) */
  candidateIdeaIds: string[];
  /** F4-02 narrowing applied per idea (for filter status) */
  narrowingAppliedByIdeaId: Map<string, boolean>;
};
