import { describe, expect, it } from 'vitest';

import {
  applyRecommendedFilter,
  computeAIBuildabilityScore,
  computeFirstSalePotential,
  computeOneJobScore,
  computeOpportunityScore,
  computeTimeFitScore,
} from '@/domain/scoring';
import type {
  AIBuildabilityCriteria,
  FirstSaleInput,
  OneJobCriteria,
} from '@/domain/scoring';

const ALL_100_ONE_JOB: OneJobCriteria = {
  explainableInOneSentence: 100,
  singlePrimaryUser: 100,
  singleProblem: 100,
  singleMainScenario: 100,
  singleClearResult: 100,
  valueOnOneExample: 100,
  singleOfferLanding: 100,
  canDropSecondaryWithoutLosingValue: 100,
};

const ALL_100_AI: AIBuildabilityCriteria = {
  typicalArchitecture: 100,
  lowNonStandardCode: 100,
  goodServiceDocs: 100,
  fewIntegrations: 100,
  officialApisAvailable: 100,
  visuallyVerifiable: 100,
  easyErrorDiagnosis: 100,
  simpleDeploy: 100,
  managedServicesOk: 100,
  incrementalBuildPossible: 100,
  manualFallbackPossible: 100,
};

const ALL_FALSE_NEGATIVES = {
  longEnterpriseCycle: false,
  multiPersonDecision: false,
  requiresImplementation: false,
  needsPersonalOnboarding: false,
  valueAppearsInMonths: false,
  highPriceNeedsApproval: false,
  audienceHardToFind: false,
  needsLargeUserBaseFirst: false,
};

const ALL_100_FIRST_SALE: FirstSaleInput = {
  audienceConcentrated: 100,
  buyerIsDecisionMaker: 100,
  noLongApproval: 100,
  shortSalesCycle: 100,
  valueImmediate: 100,
  demoInMinutes: 100,
  dmOrSmallAdsStart: 100,
  noBrandRequired: 100,
  selfServiceOk: 100,
  paymentRightAfterLaunch: 100,
  negatives: { ...ALL_FALSE_NEGATIVES },
};

function oneJobWith(overrides: Partial<OneJobCriteria>): OneJobCriteria {
  return { ...ALL_100_ONE_JOB, ...overrides };
}

describe('scoring', () => {
  describe('computeOneJobScore', () => {
    it('T1: all criteria 100 → 100', () => {
      expect(computeOneJobScore(ALL_100_ONE_JOB)).toBe(100);
    });

    it('avg of four 100 + four 50 → 75', () => {
      expect(
        computeOneJobScore(
          oneJobWith({
            explainableInOneSentence: 50,
            singlePrimaryUser: 50,
            singleProblem: 50,
            singleMainScenario: 50,
          }),
        ),
      ).toBe(75);
    });

    it('rounds .5 avg up (7×100 + 0 → 88)', () => {
      expect(
        computeOneJobScore(oneJobWith({ canDropSecondaryWithoutLosingValue: 0 })),
      ).toBe(88);
    });

    it('platform pattern: many zeros → low score', () => {
      const platform: OneJobCriteria = {
        explainableInOneSentence: 0,
        singlePrimaryUser: 0,
        singleProblem: 0,
        singleMainScenario: 50,
        singleClearResult: 50,
        valueOnOneExample: 0,
        singleOfferLanding: 0,
        canDropSecondaryWithoutLosingValue: 0,
      };
      // (0*6 + 50*2)/8 = 100/8 = 12.5 → 13
      expect(computeOneJobScore(platform)).toBe(13);
    });

    it('hard gate: empty template caps score at 59', () => {
      expect(
        computeOneJobScore(ALL_100_ONE_JOB, { oneJobTemplateFilled: false }),
      ).toBe(59);
    });

    it('hard gate: filled template keeps full score', () => {
      expect(
        computeOneJobScore(ALL_100_ONE_JOB, { oneJobTemplateFilled: true }),
      ).toBe(100);
    });
  });

  describe('computeAIBuildabilityScore', () => {
    it('all 100 → 100', () => {
      expect(computeAIBuildabilityScore(ALL_100_AI)).toBe(100);
    });

    it('below threshold pattern → 68', () => {
      // (100*7 + 50 + 0*3)/11 = 750/11 ≈ 68.18 → 68
      expect(
        computeAIBuildabilityScore({
          ...ALL_100_AI,
          typicalArchitecture: 0,
          lowNonStandardCode: 0,
          goodServiceDocs: 0,
          fewIntegrations: 50,
        }),
      ).toBe(68);
    });

    it('near threshold → 77', () => {
      // (100*7 + 50*3 + 0)/11 = 850/11 ≈ 77.27 → 77
      expect(
        computeAIBuildabilityScore({
          ...ALL_100_AI,
          typicalArchitecture: 50,
          lowNonStandardCode: 50,
          goodServiceDocs: 50,
          fewIntegrations: 0,
        }),
      ).toBe(77);
    });
  });

  describe('computeFirstSalePotential', () => {
    it('all positives 100, no negatives → 100', () => {
      expect(computeFirstSalePotential(ALL_100_FIRST_SALE)).toBe(100);
    });

    it('T3: 2 negatives → −16 from raw', () => {
      const input: FirstSaleInput = {
        ...ALL_100_FIRST_SALE,
        negatives: {
          ...ALL_FALSE_NEGATIVES,
          longEnterpriseCycle: true,
          multiPersonDecision: true,
        },
      };
      // raw=100, 100 - 8*2 = 84
      expect(computeFirstSalePotential(input)).toBe(84);
    });

    it('floor at 0 when penalties exceed raw', () => {
      const input: FirstSaleInput = {
        audienceConcentrated: 0,
        buyerIsDecisionMaker: 0,
        noLongApproval: 0,
        shortSalesCycle: 0,
        valueImmediate: 0,
        demoInMinutes: 0,
        dmOrSmallAdsStart: 0,
        noBrandRequired: 0,
        selfServiceOk: 0,
        paymentRightAfterLaunch: 0,
        negatives: {
          longEnterpriseCycle: true,
          multiPersonDecision: true,
          requiresImplementation: true,
          needsPersonalOnboarding: true,
          valueAppearsInMonths: true,
          highPriceNeedsApproval: true,
          audienceHardToFind: true,
          needsLargeUserBaseFirst: true,
        },
      };
      // raw=0, 0 - 64 → floor 0
      expect(computeFirstSalePotential(input)).toBe(0);
    });

    it('mixed positives + 1 negative', () => {
      const input: FirstSaleInput = {
        ...ALL_100_FIRST_SALE,
        audienceConcentrated: 50,
        buyerIsDecisionMaker: 50,
        negatives: {
          ...ALL_FALSE_NEGATIVES,
          audienceHardToFind: true,
        },
      };
      // raw = (50+50+100*8)/10 = 900/10 = 90; 90-8=82
      expect(computeFirstSalePotential(input)).toBe(82);
    });
  });

  describe('computeTimeFitScore', () => {
    it.each([
      [1, 100],
      [10, 100],
      [11, 85],
      [12, 85],
      [13, 70],
      [14, 70],
      [15, 0], // T4
      [30, 0],
    ] as const)('days=%i → %i', (days, expected) => {
      expect(computeTimeFitScore(days)).toBe(expected);
    });
  });

  describe('computeOpportunityScore', () => {
    it('T5: weights 0.30/0.25/0.30/0.15 match manual calc', () => {
      // 0.30*100 + 0.25*100 + 0.30*100 + 0.15*100 = 100
      expect(
        computeOpportunityScore({
          oneJobScore: 100,
          aiBuildabilityScore: 100,
          firstSalePotential: 100,
          timeFitScore: 100,
        }),
      ).toBe(100);
    });

    it('mixed scores weighted', () => {
      // 0.30*80 + 0.25*76 + 0.30*70 + 0.15*70
      // = 24 + 19 + 21 + 10.5 = 74.5 → 75
      expect(
        computeOpportunityScore({
          oneJobScore: 80,
          aiBuildabilityScore: 76,
          firstSalePotential: 70,
          timeFitScore: 70,
        }),
      ).toBe(75);
    });

    it('timeFit 0 pulls score down', () => {
      // 0.30*90 + 0.25*90 + 0.30*90 + 0.15*0 = 27+22.5+27+0 = 76.5 → 77
      expect(
        computeOpportunityScore({
          oneJobScore: 90,
          aiBuildabilityScore: 90,
          firstSalePotential: 90,
          timeFitScore: 0,
        }),
      ).toBe(77);
    });
  });

  describe('applyRecommendedFilter', () => {
    const ideal = {
      oneJobScore: 100,
      aiBuildabilityScore: 100,
      firstSalePotential: 100,
      estimatedBuildDays: 10,
      oneJobTemplate: 'For X who need Y, the product does Z',
    };

    it('T1: ideal scores → recommended', () => {
      const result = applyRecommendedFilter(ideal);
      expect(result.status).toBe('recommended');
      expect(result.exclusionReasons).toEqual([]);
    });

    it('T2: OneJob 79 → excluded below_one_job', () => {
      const result = applyRecommendedFilter({ ...ideal, oneJobScore: 79 });
      expect(result.status).toBe('excluded');
      expect(result.exclusionReasons).toContain('below_one_job');
    });

    it('T4: days=15 → excluded exceeds_14_days', () => {
      const result = applyRecommendedFilter({ ...ideal, estimatedBuildDays: 15 });
      expect(result.status).toBe('excluded');
      expect(result.exclusionReasons).toContain('exceeds_14_days');
    });

    it('T6: empty oneJobTemplate → not recommended', () => {
      const result = applyRecommendedFilter({ ...ideal, oneJobTemplate: '' });
      expect(result.status).not.toBe('recommended');
      expect(result.exclusionReasons).toContain('missing_one_job_template');
    });

    it('null template → missing_one_job_template', () => {
      const result = applyRecommendedFilter({ ...ideal, oneJobTemplate: null });
      expect(result.status).toBe('excluded');
      expect(result.exclusionReasons).toContain('missing_one_job_template');
    });

    it('below AI threshold → below_ai', () => {
      const result = applyRecommendedFilter({
        ...ideal,
        aiBuildabilityScore: 74,
      });
      expect(result.status).toBe('excluded');
      expect(result.exclusionReasons).toContain('below_ai');
    });

    it('below FirstSale → below_first_sale', () => {
      const result = applyRecommendedFilter({
        ...ideal,
        firstSalePotential: 69,
      });
      expect(result.status).toBe('excluded');
      expect(result.exclusionReasons).toContain('below_first_sale');
    });

    it('threshold edges pass: 80/75/70/14', () => {
      const result = applyRecommendedFilter({
        oneJobScore: 80,
        aiBuildabilityScore: 75,
        firstSalePotential: 70,
        estimatedBuildDays: 14,
        oneJobTemplate: 'filled',
      });
      expect(result.status).toBe('recommended');
    });

    it('narrowingApplied + fails → narrowed', () => {
      const result = applyRecommendedFilter({
        ...ideal,
        oneJobScore: 70,
        narrowingApplied: true,
      });
      expect(result.status).toBe('narrowed');
      expect(result.exclusionReasons).toContain('below_one_job');
    });

    it('platform low OneJob → platform_idea + below_one_job', () => {
      const result = applyRecommendedFilter({
        ...ideal,
        oneJobScore: 50,
      });
      expect(result.status).toBe('excluded');
      expect(result.exclusionReasons).toContain('below_one_job');
      expect(result.exclusionReasons).toContain('platform_idea');
    });
  });
});
