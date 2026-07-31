import Link from 'next/link';

export type IdeasFeedTab = 'recommended' | 'narrowed' | 'excluded';

const TABS: Array<{ id: IdeasFeedTab; label: string }> = [
  { id: 'recommended', label: 'Рекомендованные' },
  { id: 'narrowed', label: 'Суженные' },
  { id: 'excluded', label: 'Исключённые' },
];

export function IdeasFeedTabs({
  active,
  counts,
}: {
  active: IdeasFeedTab;
  counts: {
    recommended: number;
    narrowed: number;
    excluded: number;
  };
}) {
  const countFor = (id: IdeasFeedTab) => {
    if (id === 'recommended') return counts.recommended;
    if (id === 'narrowed') return counts.narrowed;
    return counts.excluded;
  };

  return (
    <nav
      aria-label="Вкладки идей"
      className="flex flex-wrap gap-1 border-b border-zinc-200 dark:border-zinc-800"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const count = countFor(tab.id);
        return (
          <Link
            key={tab.id}
            href={tab.id === 'recommended' ? '/ideas' : `/ideas?tab=${tab.id}`}
            aria-current={isActive ? 'page' : undefined}
            className={
              isActive
                ? 'border-b-2 border-zinc-900 px-3 py-2 text-sm font-medium text-zinc-900 dark:border-zinc-100 dark:text-zinc-50'
                : 'px-3 py-2 text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }
          >
            {tab.label}
            <span className="ml-1.5 tabular-nums text-zinc-400">({count})</span>
          </Link>
        );
      })}
    </nav>
  );
}
