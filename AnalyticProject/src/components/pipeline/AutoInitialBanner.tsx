'use client';

import { useEffect, useState } from 'react';

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
 * Read-only banner on /ideas when system feed auto-initial run is active.
 * Hides after succeeded/failed.
 */
export function AutoInitialBanner({ researchId, initialRun }: Props) {
  const [run, setRun] = useState<PipelineRunDto | null>(initialRun);

  useEffect(() => {
    if (!isActive(run?.status) || run?.trigger !== 'initial') return;

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
        } catch {
          // transient
        }
      })();
    }, POLL_MS);

    return () => window.clearInterval(id);
  }, [researchId, run?.status, run?.trigger]);

  const show =
    run?.trigger === 'initial' && isActive(run.status);

  if (!show) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded border border-sky-200 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/40"
      role="status"
    >
      <p className="text-sm text-sky-900 dark:text-sky-100">
        Анализ запущен автоматически
      </p>
      <PipelineStatusBadge status={run.status} />
    </div>
  );
}
