import { labelExclusionReasons } from '@/lib/idea/exclusion-reasons';
import type { IdeaDetail } from '@/lib/idea/get-detail';

export function ProvenanceSection({ idea }: { idea: IdeaDetail }) {
  const signals = idea.supportingSignalIds;
  const clusters = idea.supportingClusterIds;
  const reasons = labelExclusionReasons(idea.exclusionReasons);

  return (
    <details className="rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
      <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
        Откуда взялась идея
      </summary>
      <dl className="mt-3 flex flex-col gap-3">
        {idea.status === 'excluded' && reasons.length > 0 ? (
          <div>
            <dt className="text-xs font-medium text-zinc-500">Причины исключения</dt>
            <dd className="mt-1">
              <ul className="list-inside list-disc text-zinc-800 dark:text-zinc-200">
                {reasons.map((r) => (
                  <li key={r.code}>{r.label}</li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs font-medium text-zinc-500">Сигналы-источники</dt>
          <dd className="mt-1 font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {signals.length > 0 ? signals.join(', ') : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-zinc-500">Кластеры болей</dt>
          <dd className="mt-1 font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {clusters.length > 0 ? clusters.join(', ') : '—'}
          </dd>
        </div>
      </dl>
    </details>
  );
}
