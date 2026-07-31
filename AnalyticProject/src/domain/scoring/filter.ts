import type {
  ExclusionReason,
  FilterInput,
  FilterResult,
  IdeaStatus,
} from './types';

function isTemplateFilled(template: string | null | undefined): boolean {
  return typeof template === 'string' && template.trim().length > 0;
}

/** recommended iff 4 thresholds + non-empty oneJobTemplate */
export function applyRecommendedFilter(input: FilterInput): FilterResult {
  const reasons: ExclusionReason[] = [];

  if (input.oneJobScore < 80) {
    reasons.push('below_one_job');
  }
  if (input.oneJobScore < 60) {
    reasons.push('platform_idea');
  }
  if (input.aiBuildabilityScore < 75) {
    reasons.push('below_ai');
  }
  if (input.firstSalePotential < 70) {
    reasons.push('below_first_sale');
  }
  if (input.estimatedBuildDays > 14) {
    reasons.push('exceeds_14_days');
  }
  if (!isTemplateFilled(input.oneJobTemplate)) {
    reasons.push('missing_one_job_template');
  }

  if (reasons.length === 0) {
    return { status: 'recommended', exclusionReasons: [] };
  }

  const status: IdeaStatus = input.narrowingApplied ? 'narrowed' : 'excluded';
  return { status, exclusionReasons: reasons };
}
