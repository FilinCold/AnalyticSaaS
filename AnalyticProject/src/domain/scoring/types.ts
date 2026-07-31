/** Criterion value from LLM score_breakdown — SSOT: docs/LLM_CONTRACT.md */
export type CriterionScore = 0 | 50 | 100;

export type OneJobCriteria = {
  explainableInOneSentence: CriterionScore;
  singlePrimaryUser: CriterionScore;
  singleProblem: CriterionScore;
  singleMainScenario: CriterionScore;
  singleClearResult: CriterionScore;
  valueOnOneExample: CriterionScore;
  singleOfferLanding: CriterionScore;
  canDropSecondaryWithoutLosingValue: CriterionScore;
};

export type AIBuildabilityCriteria = {
  typicalArchitecture: CriterionScore;
  lowNonStandardCode: CriterionScore;
  goodServiceDocs: CriterionScore;
  fewIntegrations: CriterionScore;
  officialApisAvailable: CriterionScore;
  visuallyVerifiable: CriterionScore;
  easyErrorDiagnosis: CriterionScore;
  simpleDeploy: CriterionScore;
  managedServicesOk: CriterionScore;
  incrementalBuildPossible: CriterionScore;
  manualFallbackPossible: CriterionScore;
};

export type FirstSalePositives = {
  audienceConcentrated: CriterionScore;
  buyerIsDecisionMaker: CriterionScore;
  noLongApproval: CriterionScore;
  shortSalesCycle: CriterionScore;
  valueImmediate: CriterionScore;
  demoInMinutes: CriterionScore;
  dmOrSmallAdsStart: CriterionScore;
  noBrandRequired: CriterionScore;
  selfServiceOk: CriterionScore;
  paymentRightAfterLaunch: CriterionScore;
};

export type FirstSaleNegatives = {
  longEnterpriseCycle: boolean;
  multiPersonDecision: boolean;
  requiresImplementation: boolean;
  needsPersonalOnboarding: boolean;
  valueAppearsInMonths: boolean;
  highPriceNeedsApproval: boolean;
  audienceHardToFind: boolean;
  needsLargeUserBaseFirst: boolean;
};

export type FirstSaleInput = FirstSalePositives & {
  negatives: FirstSaleNegatives;
};

/** LLM score_breakdown shape used by F4 int-score functions */
export type ScoreBreakdown = {
  oneJob: OneJobCriteria;
  aiBuildability: AIBuildabilityCriteria;
  firstSale: FirstSaleInput;
};

export type IdeaStatus = 'recommended' | 'narrowed' | 'excluded';

export type ExclusionReason =
  | 'below_one_job'
  | 'below_ai'
  | 'below_first_sale'
  | 'exceeds_14_days'
  | 'missing_one_job_template'
  | 'platform_idea';

export type FilterInput = {
  oneJobScore: number;
  aiBuildabilityScore: number;
  firstSalePotential: number;
  estimatedBuildDays: number;
  oneJobTemplate: string | null | undefined;
  /** Set by F4-02 / pipeline when system narrowing was applied */
  narrowingApplied?: boolean;
};

export type FilterResult = {
  status: IdeaStatus;
  exclusionReasons: ExclusionReason[];
};
