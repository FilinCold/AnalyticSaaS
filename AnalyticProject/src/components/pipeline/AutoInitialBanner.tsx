'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PipelineStatusBadge } from '@/components/pipeline/PipelineStatusBadge';
import type { PipelineRunStatus } from '@/domain/types';

type PipelineRunDto = {
  id: string;
  status: PipelineRunStatus;
  trigger: string;
  currentStep: string | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
};

type Props = {
  researchId: string;
  initialRun: PipelineRunDto | null;
};

const POLL_MS = 3000;

function isActive(status: PipelineRunStatus | null | undefined) {
  return status === 'queued' || status === 'running';
}

/**
 * Banner on /ideas while system feed pipeline is active.
 * Parent remounts via `key` when SSR run changes. On finish → router.refresh().
 */
export function AutoInitialBanner({ researchId, initialRun }: Props) {
  const router = useRouter();
  const [run, setRun] = useState<PipelineRunDto | null>(initialRun);
  const refreshedForId = useRef<string | null>(null);

  useEffect(() => {
    if (!isActive(run?.status)) return;

    const id = window.setInterval(() => {
      void (async () => {
        try {
          const response = await fetch(
            `/api/researches/${researchId}/pipeline-runs/latest`,
          );
          if (response.status === 404) {
            setRun(null);
            return;
          }
          if (!response.ok) return;
          const latest = (await response.json()) as PipelineRunDto;
          setRun(latest);
          if (
            (latest.status === 'succeeded' || latest.status === 'failed') &&
            refreshedForId.current !== latest.id
          ) {
            refreshedForId.current = latest.id;
            router.refresh();
          }
        } catch {
          // transient
        }
      })();
    }, POLL_MS);

    return () => window.clearInterval(id);
  }, [researchId, run?.status, router]);

  const show = run != null && isActive(run.status);

  if (!show) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded border border-sky-200 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/40"
      role="status"
    >
      <p className="text-sm text-sky-900 dark:text-sky-100">
        {run.trigger === 'initial'
          ? 'Анализ запущен автоматически'
          : 'Идёт пересборка идей'}
      </p>
      <PipelineStatusBadge status={run.status} />
    </div>
  );
}
