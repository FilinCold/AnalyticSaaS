'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { parseKeywords } from '@/lib/research/keywords';

export function ResearchForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [keywordsRaw, setKeywordsRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch('/api/researches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          topic,
          keywords: parseKeywords(keywordsRaw),
        }),
      });

      const data = (await response.json()) as { id?: string; error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Не удалось создать исследование');
        return;
      }

      if (!data.id) {
        setError('Не удалось создать исследование');
        return;
      }

      router.push(`/researches/${data.id}`);
      router.refresh();
    } catch {
      setError('Не удалось создать исследование');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Название
        <input
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Тема
        <input
          type="text"
          required
          maxLength={500}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Ключевые слова
        <input
          type="text"
          value={keywordsRaw}
          onChange={(e) => setKeywordsRaw(e.target.value)}
          placeholder="через запятую, например: saas, b2b, ниша"
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Необязательно. Разделите слова запятыми.
        </span>
      </label>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? 'Создание…' : 'Создать исследование'}
      </button>
    </form>
  );
}
