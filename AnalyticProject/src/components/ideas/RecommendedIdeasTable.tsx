import Link from 'next/link';

export type IdeaListRow = {
  id: string;
  problem: string | null;
  oneJobScore: number | null;
  opportunityScore: number | null;
  estimatedBuildDays: number | null;
};

export function RecommendedIdeasTable({ ideas }: { ideas: IdeaListRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-2 py-2 font-medium">Проблема</th>
            <th className="px-2 py-2 font-medium">One Job</th>
            <th className="px-2 py-2 font-medium">Opportunity</th>
            <th className="px-2 py-2 font-medium">Дни</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
