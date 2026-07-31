/** List-row shape — docs/API.md § Ideas */

export type IdeaListRecord = {
  id: string;
  status: string;
  problem: string | null;
  oneJobTemplate: string | null;
  oneJobScore: number | null;
  aiBuildabilityScore: number | null;
  firstSalePotential: number | null;
  estimatedBuildDays: number | null;
  opportunityScore: number | null;
  exclusionReasons: unknown;
  featuresExcludedToFitDeadline?: unknown;
};

export function toIdeaListItem(row: IdeaListRecord) {
  return {
    id: row.id,
    status: row.status,
    problem: row.problem,
    oneJobTemplate: row.oneJobTemplate,
    oneJobScore: row.oneJobScore,
    aiBuildabilityScore: row.aiBuildabilityScore,
    firstSalePotential: row.firstSalePotential,
    estimatedBuildDays: row.estimatedBuildDays,
    opportunityScore: row.opportunityScore,
    exclusionReasons: Array.isArray(row.exclusionReasons)
      ? row.exclusionReasons
      : [],
    featuresExcludedToFitDeadline: Array.isArray(
      row.featuresExcludedToFitDeadline,
    )
      ? row.featuresExcludedToFitDeadline.map(String)
      : [],
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

/** Full card — docs/IDEA_CARD_SPEC.md / API.md GET /api/ideas/:ideaId */
export type IdeaDetailRecord = IdeaListRecord & {
  primaryUser: string | null;
  inputDataType: string | null;
  mainAction: string | null;
  concreteResult: string | null;
  payReason: string | null;
  buildTimeConfidence: string | null;
  mainTechnicalRisk: string | null;
  requiredIntegrations: unknown;
  featuresExcludedToFitDeadline: unknown;
  riskOfDeveloperHelp: string | null;
  fourteenDayBuildPlan: unknown;
  firstCustomerPersona: string | null;
  whereToFindCustomers: string | null;
  painStatement: string | null;
  shortOffer: string | null;
  primaryAcquisitionChannel: string | null;
  howToShowResult: string | null;
  recommendedCta: string | null;
  simplePrice: string | null;
  howToGetFirstPayment: string | null;
  continueCriteria: string | null;
  stopCriteria: string | null;
  supportingSignalIds: unknown;
  supportingClusterIds: unknown;
  scoreBreakdown: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export function toIdeaDetail(row: IdeaDetailRecord) {
  return {
    id: row.id,
    status: row.status,
    primaryUser: row.primaryUser,
    problem: row.problem,
    inputDataType: row.inputDataType,
    mainAction: row.mainAction,
    concreteResult: row.concreteResult,
    payReason: row.payReason,
    oneJobTemplate: row.oneJobTemplate,
    oneJobScore: row.oneJobScore,
    aiBuildabilityScore: row.aiBuildabilityScore,
    firstSalePotential: row.firstSalePotential,
    estimatedBuildDays: row.estimatedBuildDays,
    opportunityScore: row.opportunityScore,
    buildTimeConfidence: row.buildTimeConfidence,
    mainTechnicalRisk: row.mainTechnicalRisk,
    requiredIntegrations: asStringArray(row.requiredIntegrations),
    featuresExcludedToFitDeadline: asStringArray(
      row.featuresExcludedToFitDeadline,
    ),
    riskOfDeveloperHelp: row.riskOfDeveloperHelp,
    fourteenDayBuildPlan: row.fourteenDayBuildPlan ?? null,
    firstCustomerPersona: row.firstCustomerPersona,
    whereToFindCustomers: row.whereToFindCustomers,
    painStatement: row.painStatement,
    shortOffer: row.shortOffer,
    primaryAcquisitionChannel: row.primaryAcquisitionChannel,
    howToShowResult: row.howToShowResult,
    recommendedCta: row.recommendedCta,
    simplePrice: row.simplePrice,
    howToGetFirstPayment: row.howToGetFirstPayment,
    continueCriteria: row.continueCriteria,
    stopCriteria: row.stopCriteria,
    exclusionReasons: asStringArray(row.exclusionReasons),
    supportingSignalIds: asStringArray(row.supportingSignalIds),
    supportingClusterIds: asStringArray(row.supportingClusterIds),
    scoreBreakdown: row.scoreBreakdown ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
