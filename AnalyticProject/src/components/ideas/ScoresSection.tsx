import type { IdeaDetail } from '@/lib/idea/get-detail';

type ScoreItem = {
  label: string;
  value: number | null;
  max?: number;
};

function ScoreBadge({ label, value, max = 100 }: ScoreItem) {
  const pct =
    value == null || max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
          {value ?? '—'}
          {value != null && max !== 100 ? ` / ${max}` : null}
        </p>
      </div>
      {value != null ? (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800"
          role="meter"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className="h-full bg-zinc-700 dark:bg-zinc-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function ScoresSection({ idea }: { idea: IdeaDetail }) {
  const scores: ScoreItem[] = [
    { label: 'Одна задача', value: idea.oneJobScore },
    { label: 'Сборка с AI', value: idea.aiBuildabilityScore },
    { label: 'Первая продажа', value: idea.firstSalePotential },
    { label: 'Итоговый потенциал', value: idea.opportunityScore },
    {
      label: 'Срок, дни',
      value: idea.estimatedBuildDays,
      max: 14,
    },
  ];

  return (
    <section aria-labelledby="scores-heading" className="flex flex-col gap-4">
      <h2
        id="scores-heading"
        className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Оценки
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scores.map((s) => (
          <ScoreBadge key={s.label} {...s} />
        ))}
      </div>
      {idea.scoreBreakdown != null ? (
        <details className="rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
          <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
            Подробная разбивка оценок
          </summary>
          <pre className="mt-2 overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
            {JSON.stringify(idea.scoreBreakdown, null, 2)}
          </pre>
        </details>
      ) : null}
    </section>
  );
}
