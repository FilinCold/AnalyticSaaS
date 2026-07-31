import Link from 'next/link';

import { RefreshFeedButton } from '@/components/ideas/RefreshFeedButton';
import { AutoInitialBanner } from '@/components/pipeline/AutoInitialBanner';
import type { PipelineRunStatus } from '@/domain/types';
import { getSessionUser } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';
import { SYSTEM_FEED_TOPIC } from '@/lib/signal/system-feed';

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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Идеи</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Актуальные идеи micro-SaaS из открытых источников. Лента обновляется
          каждые 3–5 дней.
        </p>
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

      <section className="flex flex-col items-start gap-3 rounded border border-dashed border-zinc-300 px-4 py-10 dark:border-zinc-700">
        <p className="text-zinc-600 dark:text-zinc-400">
          Идеи появятся здесь после анализа источников.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Создавать исследование не нужно — лента общая для платформы.
        </p>
        <RefreshFeedButton />
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
