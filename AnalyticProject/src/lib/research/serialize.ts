export type ResearchRecord = {
  id: string;
  title: string;
  topic: string;
  keywords: string[];
  status: string;
  autoRefreshEnabled: boolean;
  lastPipelineFinishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/** API.md § Researches response shape (no userId). */
export function toResearchResponse(row: ResearchRecord) {
  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    keywords: row.keywords,
    status: row.status,
    autoRefreshEnabled: row.autoRefreshEnabled,
    lastPipelineFinishedAt: row.lastPipelineFinishedAt
      ? row.lastPipelineFinishedAt.toISOString()
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
