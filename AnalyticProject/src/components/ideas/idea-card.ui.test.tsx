import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { BuildSection } from '@/components/ideas/BuildSection';
import { SalesSection } from '@/components/ideas/SalesSection';
import type { IdeaDetail } from '@/lib/idea/get-detail';

const fixtureIdea: IdeaDetail = {
  id: 'idea-rec-1',
  status: 'recommended',
  primaryUser: 'solo indie hacker',
  problem: 'choosing a commercially testable micro-SaaS idea',
  inputDataType: 'public forum signals',
  mainAction: 'rank ideas',
  concreteResult: 'shortlist',
  payReason: 'saves weeks',
  oneJobTemplate: 'For a solo indie hacker…',
  oneJobScore: 92,
  aiBuildabilityScore: 88,
  firstSalePotential: 80,
  estimatedBuildDays: 10,
  opportunityScore: 87,
  buildTimeConfidence: 'high',
  mainTechnicalRisk: 'LLM variance',
  requiredIntegrations: ['postgres'],
  featuresExcludedToFitDeadline: [],
  riskOfDeveloperHelp: 'low',
  fourteenDayBuildPlan: [
    { day: 1, tasks: ['scaffold ingest + normalize'] },
    { day: 10, tasks: ['ideas feed read path'] },
  ],
  firstCustomerPersona: 'Solo indie hacker',
  whereToFindCustomers: 'Indie Hackers',
  painStatement: 'Weeks lost',
  shortOffer: 'Rank micro-SaaS ideas',
  primaryAcquisitionChannel: 'HN',
  howToShowResult: 'Show 3 cards',
  recommendedCta: 'Refresh feed',
  simplePrice: '$19/mo',
  howToGetFirstPayment: 'Stripe',
  continueCriteria:
    'At least one user starts building a recommended idea within 14 days',
  stopCriteria: 'No paid conversion after 30 days of active users',
  exclusionReasons: [],
  supportingSignalIds: ['sig-1'],
  supportingClusterIds: ['cluster-1'],
  scoreBreakdown: null,
  createdAt: '2026-07-30T10:00:00.000Z',
  updatedAt: '2026-07-30T11:00:00.000Z',
};

describe('idea-card UI sections', () => {
  it('T3: continue/stop criteria visible with Russian labels', () => {
    const html = renderToStaticMarkup(<SalesSection idea={fixtureIdea} />);

    expect(html).toContain('Когда продолжать');
    expect(html).toContain('Когда остановиться');
    expect(html).toContain(fixtureIdea.continueCriteria!);
    expect(html).toContain(fixtureIdea.stopCriteria!);
    expect(html).not.toContain('go/kill');
  });

  it('T4: fourteenDayBuildPlan renders day/tasks', () => {
    const html = renderToStaticMarkup(<BuildSection idea={fixtureIdea} />);

    expect(html).toContain('День 1');
    expect(html).toContain('scaffold ingest + normalize');
    expect(html).toContain('День 10');
    expect(html).toContain('ideas feed read path');
  });
});
