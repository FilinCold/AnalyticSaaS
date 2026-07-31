import Link from 'next/link';

import type { IdeaDetail } from '@/lib/idea/get-detail';

const STATUS_LABEL: Record<string, string> = {
  recommended: 'Рекомендована',
  narrowed: 'Сужена',
  excluded: 'Исключена',
  candidate: 'Кандидат',
};

export function IdeaCardHeader({ idea }: { idea: IdeaDetail }) {
  const showOpportunity =
    idea.status === 'recommended' || idea.status === 'narrowed';

  return (
    <header className="flex flex-col gap-3">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/ideas" className="underline underline-offset-2">
          Идеи
        </Link>
        {' / '}
        <span className="text-zinc-800 dark:text-zinc-200">Карточка</span>
      </p>
      {idea.status === 'excluded' ? (
        <p
          role="status"
          className="rounded border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
        >
          Исключена — не прошла пороги рекомендованных. Причины — в блоке
          «Откуда взялась идея».
        </p>
      ) : null}
      {idea.status === 'narrowed' ? (
        <p
          role="status"
          className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          Сужено системой — часть функций убрана, чтобы уложиться в 14 дней.
          Список «Убрано, чтобы уложиться в срок» — в блоке «Как собрать».
        </p>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {idea.problem?.trim() || 'Без названия'}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-zinc-300 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">
            {STATUS_LABEL[idea.status] ?? idea.status}
          </span>
          {showOpportunity && idea.opportunityScore != null ? (
            <span className="rounded border border-zinc-300 px-2 py-0.5 text-xs tabular-nums text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">
              Потенциал {idea.opportunityScore}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
