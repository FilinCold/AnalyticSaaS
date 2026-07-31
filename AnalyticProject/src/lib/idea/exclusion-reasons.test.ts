import { describe, expect, it } from 'vitest';

import {
  EXCLUSION_REASON_LABELS,
  labelExclusionReason,
  labelExclusionReasons,
} from './exclusion-reasons';

describe('exclusion reason labels', () => {
  it('maps known codes to Russian labels', () => {
    expect(labelExclusionReason('below_one_job')).toBe(
      EXCLUSION_REASON_LABELS.below_one_job,
    );
    expect(labelExclusionReason('below_ai')).toBe(
      EXCLUSION_REASON_LABELS.below_ai,
    );
    expect(labelExclusionReason('below_first_sale')).toBe(
      EXCLUSION_REASON_LABELS.below_first_sale,
    );
    expect(labelExclusionReason('exceeds_14_days')).toBe(
      EXCLUSION_REASON_LABELS.exceeds_14_days,
    );
    expect(labelExclusionReason('platform_idea')).toBe(
      EXCLUSION_REASON_LABELS.platform_idea,
    );
  });

  it('T1: two reasons → both labeled', () => {
    const labeled = labelExclusionReasons([
      'below_one_job',
      'exceeds_14_days',
    ]);
    expect(labeled).toEqual([
      {
        code: 'below_one_job',
        label: EXCLUSION_REASON_LABELS.below_one_job,
      },
      {
        code: 'exceeds_14_days',
        label: EXCLUSION_REASON_LABELS.exceeds_14_days,
      },
    ]);
  });

  it('unknown code falls back to raw code', () => {
    expect(labelExclusionReason('custom_reason')).toBe('custom_reason');
  });
});
