/**
 * Pipeline / persistence status unions (String columns in Prisma).
 * SSOT: docs/DATABASE.md, docs/DOMAIN_MODEL.md
 */

/** Idea.status — includes candidate before scoring filter */
export type IdeaDbStatus =
  | 'candidate'
  | 'recommended'
  | 'narrowed'
  | 'excluded';

export const IDEA_DB_STATUSES: readonly IdeaDbStatus[] = [
  'candidate',
  'recommended',
  'narrowed',
  'excluded',
] as const;

/** PipelineRun.status */
export type PipelineRunStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed';

export const PIPELINE_RUN_STATUSES: readonly PipelineRunStatus[] = [
  'queued',
  'running',
  'succeeded',
  'failed',
] as const;

/** PipelineRun.trigger */
export type PipelineTrigger = 'initial' | 'manual' | 'scheduled';

export const PIPELINE_TRIGGERS: readonly PipelineTrigger[] = [
  'initial',
  'manual',
  'scheduled',
] as const;

/** build_time_confidence / risk_of_developer_help */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export const CONFIDENCE_LEVELS: readonly ConfidenceLevel[] = [
  'low',
  'medium',
  'high',
] as const;
