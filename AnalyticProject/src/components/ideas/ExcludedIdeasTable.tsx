import Link from 'next/link';

import { labelExclusionReasons } from '@/lib/idea/exclusion-reasons';

export type ExcludedIdeaListRow = {
  id: string;
  problem: string | null;
  oneJobScore: number | null;
  opportunityScore: number | null;
  estimatedBuildDays: number | null;
  exclusionReasons: unknown[];
};

export function ExcludedIdeasTable({ ideas }: { ideas: ExcludedIdeaListRow[] }) {
  if (ideas.length === 0) {
    return (
      <section className="rounded border border-dashed border-zinc-300 px-4 py-10 dark:border-zinc-700">
        <p className="text-zinc-600 dark:text-zinc-400">Нет исключённых идей</p>
      </section>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-2 py-2 font-medium">Проблема</th>
            <th className="px-2 py-2 font-medium">Причины</th>
            <th className="px-2 py-2 font-medium">One Job</th>
            <th className="px-2 py-2 font-medium">Opportunity</th>
            <th className="px-2 py-2 font-medium">Дни</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => {
            const reasons = labelExclusionReasons(
              Array.isArray(idea.exclusionReasons)
                ? idea.exclusionReasons.map(String)
                : [],
            );
            return (
              <tr
                key={idea.id}
                className="border-b border-zinc-100 dark:border-zinc-900"
              >
                <td className="px-2 py-3">
                  <Link
                    href={`/ideas/${idea.id}`}
                    className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-50"
                  >
                    {idea.problem?.trim() || 'Без названия'}
                  </Link>
                </td>
                <td className="px-2 py-3">
                  <ul className="flex flex-wrap gap-1">
                    {reasons.map((r) => (
                      <li
                        key={r.code}
                        className="rounded border border-zinc-300 px-1.5 py-0.5 text-xs text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
                      >
                        {r.label}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-2 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {idea.oneJobScore ?? '—'}
                </td>
                <td className="px-2 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {idea.opportunityScore ?? '—'}
                </td>
                <td className="px-2 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {idea.estimatedBuildDays ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
