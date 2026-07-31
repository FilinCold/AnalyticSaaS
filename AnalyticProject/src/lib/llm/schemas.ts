import { z } from 'zod';

/** SSOT: docs/LLM_CONTRACT.md + docs/AI_PIPELINE.md */

export const frequencyHintSchema = z.enum(['low', 'medium', 'high']);

export const criterionScoreSchema = z.union([
  z.literal(0),
  z.literal(50),
  z.literal(100),
]);

export const extractPainsResultSchema = z.object({
  pains: z.array(
    z.object({
      signalId: z.string().min(1),
      painStatement: z.string().min(1),
      audienceHint: z.string().min(1),
      frequencyHint: frequencyHintSchema,
      evidenceQuote: z.string().min(1),
    }),
  ),
});

export const clusterPainsResultSchema = z.object({
  clusters: z.array(
    z.object({
      label: z.string().min(1),
      summary: z.string().min(1),
      frequencyHint: frequencyHintSchema,
      signalIds: z.array(z.string().min(1)),
    }),
  ),
});

export const draftIdeasResultSchema = z.object({
  ideas: z.array(
    z.object({
      clusterIds: z.array(z.string().min(1)),
      primaryUser: z.string().min(1),
      problem: z.string().min(1),
      inputDataType: z.string().min(1),
      mainAction: z.string().min(1),
      concreteResult: z.string().min(1),
      payReason: z.string().min(1),
      oneJobTemplate: z.string().min(1),
    }),
  ),
});

export const estimateBuildResultSchema = z.object({
  estimatedBuildDays: z.number().int().positive(),
  buildTimeConfidence: frequencyHintSchema,
  mainTechnicalRisk: z.string().min(1),
  requiredIntegrations: z.array(z.string()),
  featuresExcludedToFitDeadline: z.array(z.string()),
  riskOfDeveloperHelp: frequencyHintSchema,
  fourteenDayBuildPlan: z.array(
    z.object({
      day: z.number().int().min(1).max(14),
      tasks: z.array(z.string().min(1)),
    }),
  ),
  narrowingApplied: z.boolean(),
});

export const oneJobCriteriaSchema = z.object({
  explainableInOneSentence: criterionScoreSchema,
  singlePrimaryUser: criterionScoreSchema,
  singleProblem: criterionScoreSchema,
  singleMainScenario: criterionScoreSchema,
  singleClearResult: criterionScoreSchema,
  valueOnOneExample: criterionScoreSchema,
  singleOfferLanding: criterionScoreSchema,
  canDropSecondaryWithoutLosingValue: criterionScoreSchema,
});

export const aiBuildabilityCriteriaSchema = z.object({
  typicalArchitecture: criterionScoreSchema,
  lowNonStandardCode: criterionScoreSchema,
  goodServiceDocs: criterionScoreSchema,
  fewIntegrations: criterionScoreSchema,
  officialApisAvailable: criterionScoreSchema,
  visuallyVerifiable: criterionScoreSchema,
  easyErrorDiagnosis: criterionScoreSchema,
  simpleDeploy: criterionScoreSchema,
  managedServicesOk: criterionScoreSchema,
  incrementalBuildPossible: criterionScoreSchema,
  manualFallbackPossible: criterionScoreSchema,
});

export const firstSaleNegativesSchema = z.object({
  longEnterpriseCycle: z.boolean(),
  multiPersonDecision: z.boolean(),
  requiresImplementation: z.boolean(),
  needsPersonalOnboarding: z.boolean(),
  valueAppearsInMonths: z.boolean(),
  highPriceNeedsApproval: z.boolean(),
  audienceHardToFind: z.boolean(),
  needsLargeUserBaseFirst: z.boolean(),
});

export const firstSaleCriteriaSchema = z.object({
  audienceConcentrated: criterionScoreSchema,
  buyerIsDecisionMaker: criterionScoreSchema,
  noLongApproval: criterionScoreSchema,
  shortSalesCycle: criterionScoreSchema,
  valueImmediate: criterionScoreSchema,
  demoInMinutes: criterionScoreSchema,
  dmOrSmallAdsStart: criterionScoreSchema,
  noBrandRequired: criterionScoreSchema,
  selfServiceOk: criterionScoreSchema,
  paymentRightAfterLaunch: criterionScoreSchema,
  negatives: firstSaleNegativesSchema,
});

export const scoreBreakdownResultSchema = z.object({
  oneJob: oneJobCriteriaSchema,
  aiBuildability: aiBuildabilityCriteriaSchema,
  firstSale: firstSaleCriteriaSchema,
});

export const salesBlockResultSchema = z.object({
  firstCustomerPersona: z.string().min(1),
  whereToFindCustomers: z.string().min(1),
  painStatement: z.string().min(1),
  shortOffer: z.string().min(1),
  primaryAcquisitionChannel: z.string().min(1),
  howToShowResult: z.string().min(1),
  recommendedCta: z.string().min(1),
  simplePrice: z.string().min(1),
  howToGetFirstPayment: z.string().min(1),
  continueCriteria: z.string().min(1),
  stopCriteria: z.string().min(1),
});

export type ExtractPainsResult = z.infer<typeof extractPainsResultSchema>;
export type ClusterPainsResult = z.infer<typeof clusterPainsResultSchema>;
export type DraftIdeasResult = z.infer<typeof draftIdeasResultSchema>;
export type EstimateBuildResult = z.infer<typeof estimateBuildResultSchema>;
export type ScoreBreakdownResult = z.infer<typeof scoreBreakdownResultSchema>;
export type SalesBlockResult = z.infer<typeof salesBlockResultSchema>;
