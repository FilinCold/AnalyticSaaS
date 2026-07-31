'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type IngestResponse = {
  researchId?: string;
  ingestedCount?: number;
  errors?: Array<{ sourceType: string; message: string }>;
  error?: string;
};

type AnalyzeResponse = {
  pipelineRun?: { id: string; status: string };
  error?: string;
  hint?: string;
};

export function RefreshFeedButton() {
  const router = useRouter();
  const [pendingIngest, setPendingIngest] = useState(false);
  const [pendingAnalyze, setPendingAnalyze] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onIngest() {
    setPendingIngest(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/ideas/ingest', { method: 'POST' });
      const data = (await response.json()) as IngestResponse;

      if (!response.ok) {
        setError(data.error ?? 'Не удалось обновить ленту');
        return;
      }

      const count = data.ingestedCount ?? 0;
      const adapterErrors = data.errors ?? [];

      if (count > 0) {
        setMessage(
          `Добавлено новых сигналов: ${count}. Если это первый прогон — анализ стартует сам; подождите 15–60 сек и обновите страницу.`,
        );
        router.refresh();
      } else {
        setMessage(
          'Новых сигналов нет (уже загружены раньше). Лента не изменится от этой кнопки. Чтобы заново прогнать анализ идей — нажмите «Пересобрать идеи».',
        );
      }

      if (adapterErrors.length > 0) {
        setError(
          adapterErrors.map((e) => `${e.sourceType}: ${e.message}`).join('; '),
        );
      }
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз.');
    } finally {
      setPendingIngest(false);
    }
  }

  async function onAnalyze() {
    setPendingAnalyze(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/ideas/analyze', { method: 'POST' });
      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok) {
        setError(
          [data.error, data.hint].filter(Boolean).join(' ') ||
            'Не удалось запустить анализ',
        );
        return;
      }

      setMessage(
        'Анализ идей запущен. Статус появится сверху; через 15–60 сек обновите страницу (F5).',
      );
      router.refresh();
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз.');
    } finally {
      setPendingAnalyze(false);
    }
  }

  const busy = pendingIngest || pendingAnalyze;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onIngest}
          disabled={busy}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pendingIngest ? 'Обновление…' : 'Обновить ленту'}
        </button>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={busy}
          className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-100"
        >
          {pendingAnalyze ? 'Запуск…' : 'Пересобрать идеи'}
        </button>
      </div>
      {message ? (
        <p
          className="max-w-md text-sm text-zinc-700 dark:text-zinc-300"
          role="status"
        >
          {message}
        </p>
      ) : (
        <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-400">
          «Обновить ленту» — подтянуть новые сигналы из источников.
          «Пересобрать идеи» — заново прогнать анализ по уже загруженным
          сигналам.
        </p>
      )}
      {error ? (
        <p className="max-w-md text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
