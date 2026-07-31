'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type IngestResponse = {
  ingestedCount?: number;
  errors?: Array<{ sourceType: string; message: string }>;
  error?: string;
};

export function RefreshFeedButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
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
      const parts = [`Добавлено сигналов: ${count}`];
      if (adapterErrors.length > 0) {
        parts.push(
          adapterErrors.map((e) => `${e.sourceType}: ${e.message}`).join('; '),
        );
      }
      setMessage(parts.join('. '));
      if (count > 0) {
        router.refresh();
      }
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? 'Обновление…' : 'Обновить ленту'}
      </button>
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
