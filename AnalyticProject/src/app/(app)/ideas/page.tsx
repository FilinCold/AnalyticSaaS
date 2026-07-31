import Link from 'next/link';

import { ExcludedIdeasTable } from '@/components/ideas/ExcludedIdeasTable';
import { IdeasFeedTabs, type IdeasFeedTab } from '@/components/ideas/IdeasFeedTabs';
import { NarrowedIdeasTable } from '@/components/ideas/NarrowedIdeasTable';
import { RecommendedIdeasTable } from '@/components/ideas/RecommendedIdeasTable';
import { RefreshFeedButton } from '@/components/ideas/RefreshFeedButton';
import { AutoInitialBanner } from '@/components/pipeline/AutoInitialBanner';
import type { PipelineRunStatus } from '@/domain/types';
import { getSessionUser } from '@/lib/auth/get-session';
import { listIdeasFeed } from '@/lib/idea/list-feed';
import { prisma } from '@/lib/prisma';
import { SYSTEM_FEED_TOPIC } from '@/lib/signal/system-feed';

function parseTab(raw: string | string[] | undefined): IdeasFeedTab {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'narrowed' || value === 'excluded') return value;
  return 'recommended';
}

export default async function IdeasFeedPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const params = (await searchParams) ?? {};
  const tab = parseTab(params.tab);

  const feedStatus =
    tab === 'excluded' ? 'excluded' : tab === 'narrowed' ? 'narrowed' : 'recommended';
  const feed = await listIdeasFeed(feedStatus);

  const systemFeed = await prisma.research.findFirst({
    where: { topic: SYSTEM_FEED_TOPIC },
    select: { id: true },
  });

  const latestRun = systemFeed
    ? await prisma.pipelineRun.findFirst({
        where: { researchId: systemFeed.id },
        orderBy: { createdAt: 'desc' },
      })
    : null;

  const stats = feed.stats; // same counts for any status filter

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Идеи</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Актуальные идеи micro-SaaS из открытых источников. Лента обновляется
            каждые 3–5 дней.
          </p>
        </div>
        <RefreshFeedButton />
      </div>

      {systemFeed ? (
        <AutoInitialBanner
          key={`${latestRun?.id ?? 'none'}-${latestRun?.status ?? 'none'}-${latestRun?.createdAt?.toISOString() ?? ''}`}
          researchId={systemFeed.id}
          initialRun={
            latestRun
              ? {
                  id: latestRun.id,
                  status: latestRun.status as PipelineRunStatus,
                  trigger: latestRun.trigger,
                  currentStep: latestRun.currentStep,
                  error: latestRun.error,
                  createdAt: latestRun.createdAt.toISOString(),
                  finishedAt: latestRun.finishedAt
                    ? latestRun.finishedAt.toISOString()
                    : null,
                }
              : null
          }
        />
      ) : null}

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

      <IdeasFeedTabs
        active={tab}
        counts={{
          recommended: stats.recommendedCount,
          narrowed: stats.narrowedCount,
          excluded: stats.excludedCount,
        }}
      />

      {tab === 'recommended' ? (
        feed.ideas.length > 0 ? (
          <RecommendedIdeasTable ideas={feed.ideas} />
        ) : (
          <section className="flex flex-col items-start gap-3 rounded border border-dashed border-zinc-300 px-4 py-10 dark:border-zinc-700">
            <p className="text-zinc-600 dark:text-zinc-400">
              Нет рекомендованных идей
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Идеи появятся здесь после анализа источников.
            </p>
            {stats.excludedCount > 0 ? (
              <Link
                href="/ideas?tab=excluded"
                className="text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
              >
                Посмотреть исключённые ({stats.excludedCount})
              </Link>
            ) : null}
          </section>
        )
      ) : tab === 'excluded' ? (
        <ExcludedIdeasTable ideas={feed.ideas} />
      ) : (
        <NarrowedIdeasTable ideas={feed.ideas} />
      )}

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
