/** Human-readable labels for Idea.exclusionReasons codes (F6-03). */

export const EXCLUSION_REASON_LABELS = {
  below_one_job: 'Ниже порога One Job',
  below_ai: 'Ниже порога AI Buildability',
  below_first_sale: 'Ниже порога First Sale',
  exceeds_14_days: 'Больше 14 дней на сборку',
  platform_idea: 'Платформенная идея',
  missing_one_job_template: 'Нет шаблона One Job',
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
