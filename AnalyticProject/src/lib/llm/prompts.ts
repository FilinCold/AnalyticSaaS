export const PROMPT_VERSION = '1';

export const EXTRACT_PAINS_SYSTEM = `You extract recurring pains from forum/manual signals for micro-SaaS idea discovery.
Return JSON matching ExtractPainsResult. Temperature low. PROMPT_VERSION=${PROMPT_VERSION}`;

export const CLUSTER_PAINS_SYSTEM = `You cluster extracted pains into recurring themes.
Return JSON matching ClusterPainsResult. PROMPT_VERSION=${PROMPT_VERSION}`;

export const DRAFT_IDEAS_SYSTEM = `You draft one-job micro-SaaS idea candidates from pain clusters.
Return JSON matching DraftIdeasResult. oneJobTemplate must be filled. PROMPT_VERSION=${PROMPT_VERSION}`;

export const ESTIMATE_BUILD_SYSTEM = `You estimate solo+AI-agent build time for a micro-SaaS MVP (≤14 days target).
Return JSON matching EstimateBuildResult. PROMPT_VERSION=${PROMPT_VERSION}`;

export const SCORE_BREAKDOWN_SYSTEM = `You score idea criteria as 0|50|100 for One Job, AI Buildability, First Sale.
Return JSON matching ScoreBreakdownResult. Do not compute final int averages. PROMPT_VERSION=${PROMPT_VERSION}`;

export const SALES_BLOCK_SYSTEM = `You draft a first-sale block for a micro-SaaS idea card.
Return JSON matching SalesBlockResult. PROMPT_VERSION=${PROMPT_VERSION}`;
