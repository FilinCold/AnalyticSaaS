import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { ExcludedIdeasTable } from '@/components/ideas/ExcludedIdeasTable';
import { IdeaCardHeader } from '@/components/ideas/IdeaCardHeader';
import { EXCLUSION_REASON_LABELS } from '@/lib/idea/exclusion-reasons';
import type { IdeaDetail } from '@/lib/idea/get-detail';

describe('excluded-list UI', () => {
  it('T1: excluded with 2 reasons — both Russian labels shown', () => {
    const html = renderToStaticMarkup(
      <ExcludedIdeasTable
        ideas={[
          {
            id: 'ex-1',
            problem: 'Too broad platform idea',
            oneJobScore: 50,
            opportunityScore: 40,
            estimatedBuildDays: 20,
            exclusionReasons: ['below_one_job', 'exceeds_14_days'],
          },
        ]}
      />,
    );

    expect(html).toContain('Too broad platform idea');
    expect(html).toContain(EXCLUSION_REASON_LABELS.below_one_job);
    expect(html).toContain(EXCLUSION_REASON_LABELS.exceeds_14_days);
    expect(html).toContain('/ideas/ex-1');
    expect(html).toContain('50');
    expect(html).toContain('20');
  });

  it('T2: recommended idea not rendered in excluded table', () => {
    const html = renderToStaticMarkup(<ExcludedIdeasTable ideas={[]} />);

    expect(html).toContain('Нет исключённых идей');
    expect(html).not.toContain('Pain recommended');
  });

  it('excluded card shows banner «Исключена»', () => {
    const idea: IdeaDetail = {
      id: 'ex-1',
      status: 'excluded',
      primaryUser: null,
      problem: 'Excluded pain',
      inputDataType: null,
      mainAction: null,
      concreteResult: null,
      payReason: null,
      oneJobTemplate: null,
      oneJobScore: 50,
      aiBuildabilityScore: 70,
      firstSalePotential: 60,
      estimatedBuildDays: 20,
      opportunityScore: 40,
      buildTimeConfidence: null,
      mainTechnicalRisk: null,
      requiredIntegrations: [],
      featuresExcludedToFitDeadline: [],
      riskOfDeveloperHelp: null,
      fourteenDayBuildPlan: null,
      firstCustomerPersona: null,
      whereToFindCustomers: null,
      painStatement: null,
      shortOffer: null,
      primaryAcquisitionChannel: null,
      howToShowResult: null,
      recommendedCta: null,
      simplePrice: null,
      howToGetFirstPayment: null,
      continueCriteria: null,
      stopCriteria: null,
      exclusionReasons: ['below_one_job'],
      supportingSignalIds: [],
      supportingClusterIds: [],
      scoreBreakdown: null,
      createdAt: '2026-07-30T10:00:00.000Z',
      updatedAt: '2026-07-30T11:00:00.000Z',
    };

    const html = renderToStaticMarkup(<IdeaCardHeader idea={idea} />);

    expect(html).toContain('Исключена');
    expect(html).toContain('Excluded pain');
  });
});
