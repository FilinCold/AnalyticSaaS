'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export type SignalListItem = {
  id: string;
  rawText: string;
  capturedAt: string;
  sourceType: string;
};

type ManualSignalFormProps = {
  researchId: string;
  initialSignals: SignalListItem[];
};

function previewText(raw: string): string {
  if (raw.length <= 200) {
    return raw;
  }
  return `${raw.slice(0, 200)}…`;
}

function formatCapturedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString('ru-RU');
}

export function ManualSignalForm({
  researchId,
  initialSignals,
}: ManualSignalFormProps) {
  const router = useRouter();
  const [rawText, setRawText] = useState('');
  const [signals, setSignals] = useState(initialSignals);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch(`/api/researches/${researchId}/signals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      const data = (await response.json()) as SignalListItem & {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? 'Не удалось добавить сигнал');
        return;
      }

      setSignals((prev) => [
        {
          id: data.id,
          rawText: data.rawText,
          capturedAt: data.capturedAt,
          sourceType: data.sourceType,
        },
        ...prev,
      ]);
      setRawText('');
      router.refresh();
    } catch {
      setError('Не удалось добавить сигнал');
    } finally {
      setPending(false);
    }
  }

  const count = signals.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {count}{' '}
          {count === 1 ? 'сигнал' : count >= 2 && count <= 4 ? 'сигнала' : 'сигналов'}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Для демо рекомендуется ≥3
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Текст сигнала
          <textarea
            required
            maxLength={50_000}
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Вставьте боль / цитату / пост…"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? 'Добавление…' : 'Добавить'}
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {signals.length === 0 ? (
          <li className="text-sm text-zinc-500 dark:text-zinc-400">
            Пока нет сигналов. Добавьте вручную или позже через адаптеры.
          </li>
        ) : (
          signals.map((signal) => (
            <li
              key={signal.id}
              className="border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800"
            >
              <p className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-50">
                {previewText(signal.rawText)}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {formatCapturedAt(signal.capturedAt)} · {signal.sourceType}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
