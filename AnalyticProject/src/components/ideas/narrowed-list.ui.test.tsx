import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { IdeaCardHeader } from '@/components/ideas/IdeaCardHeader';
import { NarrowedIdeasTable } from '@/components/ideas/NarrowedIdeasTable';
import type { IdeaDetail } from '@/lib/idea/get-detail';

describe('narrowed-list UI', () => {
  it('T1: narrowed idea — features shown, badge and CTA to card', () => {
    const html = renderToStaticMarkup(
      <NarrowedIdeasTable
        ideas={[
          {
            id: 'nar-1',
            problem: 'Narrowed pain',
            oneJobScore: 80,
            opportunityScore: 72,
            estimatedBuildDays: 12,
            featuresExcludedToFitDeadline: ['SSO', 'Mobile app'],
          },
        ]}
      />,
    );

    expect(html).toContain('Narrowed pain');
    expect(html).toContain('Сужено системой');
    expect(html).toContain('SSO');
    expect(html).toContain('Mobile app');
    expect(html).toContain('Открыть карточку');
    expect(html).toContain('/ideas/nar-1');
    expect(html).not.toContain('Исключена');
  });

  it('T2: recommended not rendered in narrowed table', () => {
    const html = renderToStaticMarkup(<NarrowedIdeasTable ideas={[]} />);

    expect(html).toContain('Нет суженных идей');
    expect(html).not.toContain('Pain recommended');
  });

  it('narrowed card shows banner «Сужено системой»', () => {
    const idea: IdeaDetail = {
      id: 'nar-1',
      status: 'narrowed',
      primaryUser: null,
      problem: 'Narrowed pain',
      inputDataType: null,
      mainAction: null,
      concreteResult: null,
      payReason: null,
      oneJobTemplate: null,
      oneJobScore: 80,
      aiBuildabilityScore: 75,
      firstSalePotential: 70,
      estimatedBuildDays: 12,
      opportunityScore: 72,
      buildTimeConfidence: null,
      mainTechnicalRisk: null,
      requiredIntegrations: [],
      featuresExcludedToFitDeadline: ['SSO'],
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
      exclusionReasons: [],
      supportingSignalIds: [],
      supportingClusterIds: [],
      scoreBreakdown: null,
      createdAt: '2026-07-30T10:00:00.000Z',
      updatedAt: '2026-07-30T11:00:00.000Z',
    };

    const html = renderToStaticMarkup(<IdeaCardHeader idea={idea} />);

    expect(html).toContain('Сужено системой');
    expect(html).toContain('Narrowed pain');
    expect(html).not.toContain('Исключена —');
  });
});
