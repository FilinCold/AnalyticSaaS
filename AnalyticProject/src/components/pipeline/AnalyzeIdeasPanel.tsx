'use client';

import { useCallback, useEffect, useState } from 'react';

import { PipelineStatusBadge } from '@/components/pipeline/PipelineStatusBadge';
import type { PipelineRunStatus } from '@/domain/types';
import { MANUAL_COOLDOWN_MS } from '@/lib/pipeline/constants';

type PipelineRunDto = {
  id: string;
  status: PipelineRunStatus;
  trigger: string;
  currentStep: string | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
};

type AnalyzeResponse = {
  pipelineRun?: { id: string; status: PipelineRunStatus; trigger: string; createdAt: string };
  error?: string;
  code?: string;
};

type Props = {
  researchId: string;
  initialRun: PipelineRunDto | null;
};

const POLL_MS = 3000;

function isActive(status: PipelineRunStatus | null | undefined) {
  return status === 'queued' || status === 'running';
}

function cooldownActive(run: PipelineRunDto | null): boolean {
  if (!run || run.trigger !== 'manual') return false;
  const started = Date.parse(run.createdAt);
  if (Number.isNaN(started)) return false;
  return Date.now() - started < MANUAL_COOLDOWN_MS;
}

export function AnalyzeIdeasPanel({ researchId, initialRun }: Props) {
  const [run, setRun] = useState<PipelineRunDto | null>(initialRun);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    initialRun?.status === 'failed' ? (initialRun.error ?? 'Ошибка анализа') : null,
  );
  const [message, setMessage] = useState<string | null>(null);

  const refreshLatest = useCallback(async () => {
    const response = await fetch(
      `/api/researches/${researchId}/pipeline-runs/latest`,
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('status_fetch_failed');
    }
    return (await response.json()) as PipelineRunDto;
  }, [researchId]);

  useEffect(() => {
    if (!isActive(run?.status)) return;

    const id = window.setInterval(() => {
      void (async () => {
        try {
          const latest = await refreshLatest();
          if (!latest) return;
          setRun(latest);
          if (latest.status === 'succeeded') {
            setMessage('Анализ завершён');
            setError(null);
          } else if (latest.status === 'failed') {
            setError(latest.error ?? 'Ошибка анализа');
            setMessage(null);
          }
        } catch {
          // keep polling; transient network blip
        }
      })();
    }, POLL_MS);

    return () => window.clearInterval(id);
  }, [run?.status, refreshLatest]);

  const disabled =
    pending || isActive(run?.status) || cooldownActive(run);

  async function startAnalyze() {
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/researches/${researchId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      });
      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok) {
        setError(data.error ?? 'Не удалось запустить анализ');
        return;
      }

      if (data.pipelineRun) {
        setRun({
          id: data.pipelineRun.id,
          status: data.pipelineRun.status,
          trigger: data.pipelineRun.trigger,
          currentStep: null,
          error: null,
          createdAt: data.pipelineRun.createdAt,
          finishedAt: null,
        });
        setMessage('Анализ поставлен в очередь');
      }
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз.');
    } finally {
      setPending(false);
    }
  }

  const failed = run?.status === 'failed';
  const autoInitialActive =
    run?.trigger === 'initial' && isActive(run.status);
  const buttonLabel = failed
    ? pending
      ? 'Запуск…'
      : 'Повторить анализ'
    : pending
      ? 'Запуск…'
      : 'Обновить идеи';

  return (
    <div className="flex flex-col items-start gap-3">
      {autoInitialActive ? (
        <p
          className="rounded border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100"
          role="status"
        >
          Анализ запущен автоматически
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <PipelineStatusBadge status={run?.status ?? null} />
        <button
          type="button"
          onClick={() => void startAnalyze()}
          disabled={disabled}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {buttonLabel}
        </button>
      </div>
      {message ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
