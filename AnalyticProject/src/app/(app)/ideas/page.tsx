import Link from 'next/link';

import { getSessionUser } from '@/lib/auth/get-session';

type IdeasStats = {
  recommendedCount: number;
  narrowedCount: number;
  excludedCount: number;
  lastPipelineFinishedAt: string | null;
};

export default async function IdeasFeedPage() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const stats: IdeasStats = {
    recommendedCount: 0,
    narrowedCount: 0,
    excludedCount: 0,
    lastPipelineFinishedAt: null,
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Идеи</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Актуальные идеи micro-SaaS из открытых источников. Лента обновляется
          каждые 3–5 дней.
        </p>
      </div>

      <section
        aria-label="Статистика ленты"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <Stat label="Рекомендованные" value={String(stats.recommendedCount)} />
        <Stat label="Суженные" value={String(stats.narrowedCount)} />
        <Stat label="Исключённые" value={String(stats.excludedCount)} />
        <Stat
          label="Обновлено"
          value={
            stats.lastPipelineFinishedAt
              ? new Date(stats.lastPipelineFinishedAt).toLocaleDateString(
                  'ru-RU',
                )
              : 'Ещё нет'
          }
        />
      </section>

      <section className="flex flex-col items-start gap-3 rounded border border-dashed border-zinc-300 px-4 py-10 dark:border-zinc-700">
        <p className="text-zinc-600 dark:text-zinc-400">
          Идеи появятся здесь после анализа источников.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Создавать исследование не нужно — лента общая для платформы.
        </p>
      </section>

      <p className="text-xs text-zinc-400">
        Служебно:{' '}
        <Link href="/researches" className="underline underline-offset-2">
          исследования
        </Link>
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-medium tracking-tight">{value}</p>
    </div>
  );
}
