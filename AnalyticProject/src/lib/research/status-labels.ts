/** UI labels for Research.status (stored as English codes). */

const RESEARCH_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  running: 'Анализ…',
  ready: 'Готово',
  failed: 'Ошибка',
};

export function labelResearchStatus(status: string): string {
  return RESEARCH_STATUS_LABELS[status] ?? status;
}
