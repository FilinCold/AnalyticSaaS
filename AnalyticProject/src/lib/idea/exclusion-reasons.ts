/** Human-readable labels for Idea.exclusionReasons codes (F6-03). */

export const EXCLUSION_REASON_LABELS = {
  below_one_job: 'Слабая оценка «одна задача»',
  below_ai: 'Слабая оценка «сборка с AI»',
  below_first_sale: 'Слабая оценка «первая продажа»',
  exceeds_14_days: 'Срок сборки больше 14 дней',
  platform_idea: 'Слишком широкая платформенная идея',
  missing_one_job_template: 'Нет формулировки одной задачи',
} as const;

export type KnownExclusionReason = keyof typeof EXCLUSION_REASON_LABELS;

export type LabeledExclusionReason = {
  code: string;
  label: string;
};

export function labelExclusionReason(code: string): string {
  if (code in EXCLUSION_REASON_LABELS) {
    return EXCLUSION_REASON_LABELS[code as KnownExclusionReason];
  }
  return code;
}

export function labelExclusionReasons(
  codes: readonly string[],
): LabeledExclusionReason[] {
  return codes.map((code) => ({
    code,
    label: labelExclusionReason(code),
  }));
}
