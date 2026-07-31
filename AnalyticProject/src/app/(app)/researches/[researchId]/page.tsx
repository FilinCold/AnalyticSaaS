import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AnalyzeIdeasPanel } from '@/components/pipeline/AnalyzeIdeasPanel';
import { AutoRefreshToggle } from '@/components/research/AutoRefreshToggle';
import { ManualSignalForm } from '@/components/signals/ManualSignalForm';
import type { PipelineRunStatus } from '@/domain/types';
import { getSessionUser } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';

type PageProps = {
  params: Promise<{ researchId: string }>;
};

export default async function ResearchDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const { researchId } = await params;

  const research = await prisma.research.findFirst({
    where: { id: researchId, userId: user.id },
  });

  if (!research) {
    notFound();
  }

  const [signals, latestRun] = await Promise.all([
    prisma.signal.findMany({
      where: { researchId: research.id },
      orderBy: { capturedAt: 'desc' },
      select: {
        id: true,
        rawText: true,
        capturedAt: true,
        sourceType: true,
      },
    }),
    prisma.pipelineRun.findFirst({
      where: { researchId: research.id },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/researches" className="underline underline-offset-2">
            Исследования
          </Link>
          {' / '}
          <span className="text-zinc-800 dark:text-zinc-200">
            {research.title}
          </span>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {research.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Статус: {research.status}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Последнее обновление:{' '}
          {research.lastPipelineFinishedAt
            ? research.lastPipelineFinishedAt.toLocaleDateString('ru-RU')
            : 'ещё не было'}
        </p>
      </div>

      <section className="flex flex-col gap-3 text-sm">
        <div>
          <h2 className="font-medium text-zinc-500 dark:text-zinc-400">Тема</h2>
          <p className="mt-1 text-zinc-900 dark:text-zinc-50">{research.topic}</p>
        </div>
        <div>
          <h2 className="font-medium text-zinc-500 dark:text-zinc-400">
            Ключевые слова
          </h2>
          <p className="mt-1 text-zinc-900 dark:text-zinc-50">
            {research.keywords.length > 0
              ? research.keywords.join(', ')
              : '—'}
          </p>
        </div>
        <AutoRefreshToggle
          researchId={research.id}
          initialEnabled={research.autoRefreshEnabled}
        />
      </section>

      <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold tracking-tight">Сигналы</h2>
        <div className="mt-4">
          <ManualSignalForm
            researchId={research.id}
            initialSignals={signals.map((s) => ({
              id: s.id,
              rawText: s.rawText,
              capturedAt: s.capturedAt.toISOString(),
              sourceType: s.sourceType,
            }))}
          />
        </div>
      </section>

      <section className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold tracking-tight">Идеи</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Появится в F6 — вкладки рекомендованные / суженные / исключённые.
        </p>
        <div className="mt-4">
          <AnalyzeIdeasPanel
            researchId={research.id}
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
        </div>
      </section>
    </main>
  );
}
