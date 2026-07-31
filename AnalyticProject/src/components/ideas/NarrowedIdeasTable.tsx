import Link from 'next/link';

export type NarrowedIdeaListRow = {
  id: string;
  problem: string | null;
  oneJobScore: number | null;
  opportunityScore: number | null;
  estimatedBuildDays: number | null;
  featuresExcludedToFitDeadline: unknown[];
};

export function NarrowedIdeasTable({ ideas }: { ideas: NarrowedIdeaListRow[] }) {
  if (ideas.length === 0) {
    return (
      <section className="rounded border border-dashed border-zinc-300 px-4 py-10 dark:border-zinc-700">
        <p className="text-zinc-600 dark:text-zinc-400">Нет суженных идей</p>
      </section>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-2 py-2 font-medium">Проблема</th>
            <th className="px-2 py-2 font-medium">Статус</th>
            <th className="px-2 py-2 font-medium">Убрано под срок</th>
            <th className="px-2 py-2 font-medium">Потенциал</th>
            <th className="px-2 py-2 font-medium">Срок, дни</th>
            <th className="px-2 py-2 font-medium">
              <span className="sr-only">Действие</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => {
            const features = Array.isArray(idea.featuresExcludedToFitDeadline)
              ? idea.featuresExcludedToFitDeadline.map(String)
              : [];
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
                  <span className="rounded border border-zinc-300 px-1.5 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">
                    Сужено системой
                  </span>
                </td>
                <td className="px-2 py-3">
                  {features.length === 0 ? (
                    <span className="text-zinc-500">—</span>
                  ) : (
                    <ul className="flex flex-wrap gap-1">
                      {features.map((f) => (
                        <li
                          key={f}
                          className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
                        >
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-2 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {idea.opportunityScore ?? '—'}
                </td>
                <td className="px-2 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {idea.estimatedBuildDays ?? '—'}
                </td>
                <td className="px-2 py-3">
                  <Link
                    href={`/ideas/${idea.id}`}
                    className="text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
                  >
                    Открыть карточку
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
