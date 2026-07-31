import type { PipelineRunStatus, PipelineTrigger } from '@/domain/types';

export type PipelineRunRecord = {
  id: string;
  status: string;
  trigger: string;
  currentStep: string | null;
  error: string | null;
  createdAt: Date;
  finishedAt: Date | null;
};

/** API.md § Pipeline run response. */
export function toPipelineRunResponse(row: PipelineRunRecord) {
  return {
    id: row.id,
    status: row.status as PipelineRunStatus,
    trigger: row.trigger as PipelineTrigger,
    currentStep: row.currentStep,
    error: row.error,
    createdAt: row.createdAt.toISOString(),
    finishedAt: row.finishedAt ? row.finishedAt.toISOString() : null,
  };
}

export function toAnalyzeAcceptedResponse(row: PipelineRunRecord) {
  return {
    pipelineRun: {
      id: row.id,
      status: row.status as PipelineRunStatus,
      trigger: row.trigger as PipelineTrigger,
      createdAt: row.createdAt.toISOString(),
    },
  };
}
