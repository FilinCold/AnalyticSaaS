'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type NarrowingEditFormProps = {
  ideaId: string;
  status: string;
  featuresExcludedToFitDeadline: string[];
  mainAction: string | null;
  concreteResult: string | null;
};

type IdeaResponse = {
  status?: string;
  error?: string;
};

const STATUS_LABEL: Record<string, string> = {
  recommended: 'рекомендована',
  narrowed: 'сужена',
  excluded: 'исключена',
  candidate: 'кандидат',
};

export function NarrowingEditForm({
  ideaId,
  status,
  featuresExcludedToFitDeadline,
  mainAction,
  concreteResult,
}: NarrowingEditFormProps) {
  const router = useRouter();
  const editable = status === 'narrowed' || status === 'recommended';

  const [features, setFeatures] = useState(featuresExcludedToFitDeadline);
  const [action, setAction] = useState(mainAction ?? '');
  const [result, setResult] = useState(concreteResult ?? '');
  const [newFeature, setNewFeature] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!editable) {
    return null;
  }

  function removeFeature(feature: string) {
    setFeatures((prev) => prev.filter((f) => f !== feature));
  }

  function addFeature() {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    if (features.includes(trimmed)) {
      setNewFeature('');
      return;
    }
    if (features.length >= 20) {
      setError('Не больше 20 исключённых функций');
      return;
    }
    setFeatures((prev) => [...prev, trimmed]);
    setNewFeature('');
  }

  async function onRescore() {
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const patchBody: Record<string, unknown> = {
        featuresExcludedToFitDeadline: features,
      };
      if (action.trim()) patchBody.mainAction = action.trim();
      if (result.trim()) patchBody.concreteResult = result.trim();

      const patchRes = await fetch(`/api/ideas/${ideaId}/narrowing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      });
      const patchData = (await patchRes.json()) as IdeaResponse;
      if (!patchRes.ok) {
        setError(patchData.error ?? 'Не удалось сохранить сужение');
        return;
      }

      const rescoreRes = await fetch(`/api/ideas/${ideaId}/rescore`, {
        method: 'POST',
      });
      const rescoreData = (await rescoreRes.json()) as IdeaResponse;
      if (!rescoreRes.ok) {
        setError(rescoreData.error ?? 'Не удалось пересчитать оценки');
        return;
      }

      const nextStatus = rescoreData.status ?? status;
      if (nextStatus === 'recommended') {
        setMessage('Статус: рекомендована');
      } else if (nextStatus === 'narrowed') {
        setMessage('Статус: остаётся суженной');
      } else if (nextStatus === 'excluded') {
        setMessage('Статус: исключена');
      } else {
        setMessage(`Статус: ${STATUS_LABEL[nextStatus] ?? nextStatus}`);
      }
      router.refresh();
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      aria-labelledby="narrowing-edit-heading"
      className="flex flex-col gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800"
    >
      <h2
        id="narrowing-edit-heading"
        className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Сужение объёма
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Уберите второстепенные функции и пересчитайте оценки. Срок сборки
        считается просто: −2 дня за каждую убранную функцию (без полного
        повторного анализа).
      </p>

      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Убрано, чтобы уложиться в срок
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {features.length === 0 ? (
            <li className="text-sm text-zinc-500">Нет исключений</li>
          ) : (
            features.map((feature) => (
              <li key={feature}>
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  disabled={pending}
                  className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-sm text-zinc-800 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                  aria-label={`Убрать ${feature}`}
                >
                  {feature}
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addFeature();
              }
            }}
            disabled={pending}
            placeholder="Добавить функцию"
            maxLength={200}
            className="min-w-[12rem] flex-1 rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
          <button
            type="button"
            onClick={addFeature}
            disabled={pending}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm disabled:opacity-60 dark:border-zinc-600"
          >
            Добавить
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Главное действие (опционально)
        </span>
        <input
          type="text"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          disabled={pending}
          maxLength={500}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 dark:border-zinc-600 dark:bg-zinc-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Конкретный результат (опционально)
        </span>
        <input
          type="text"
          value={result}
          onChange={(e) => setResult(e.target.value)}
          disabled={pending}
          maxLength={500}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 dark:border-zinc-600 dark:bg-zinc-950"
        />
      </label>

      <button
        type="button"
        onClick={onRescore}
        disabled={pending}
        className="w-fit rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? 'Пересчёт…' : 'Пересчитать оценки'}
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
    </section>
  );
}
