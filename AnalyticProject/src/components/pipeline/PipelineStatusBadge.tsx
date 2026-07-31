import type { PipelineRunStatus } from '@/domain/types';

const LABELS: Record<PipelineRunStatus, string> = {
  queued: 'В очереди',
  running: 'Анализ…',
  succeeded: 'Готово',
  failed: 'Ошибка',
};

type Props = {
  status: PipelineRunStatus | null;
};

export function PipelineStatusBadge({ status }: Props) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Нет запусков
      </span>
    );
  }

  const tone =
    status === 'failed'
      ? 'border-red-300 text-red-700 dark:border-red-800 dark:text-red-400'
      : status === 'succeeded'
        ? 'border-emerald-300 text-emerald-800 dark:border-emerald-800 dark:text-emerald-400'
        : status === 'running' || status === 'queued'
          ? 'border-amber-300 text-amber-800 dark:border-amber-800 dark:text-amber-400'
          : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400';

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${tone}`}
      data-status={status}
    >
      {LABELS[status]}
    </span>
  );
}
