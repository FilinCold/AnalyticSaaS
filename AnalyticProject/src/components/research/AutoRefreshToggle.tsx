'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  researchId: string;
  initialEnabled: boolean;
};

export function AutoRefreshToggle({ researchId, initialEnabled }: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: boolean) {
    setError(null);
    setPending(true);
    const previous = enabled;
    setEnabled(next);

    try {
      const response = await fetch(`/api/researches/${researchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoRefreshEnabled: next }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setEnabled(previous);
        setError(data.error ?? 'Не удалось сохранить');
        return;
      }

      router.refresh();
    } catch {
      setEnabled(previous);
      setError('Не удалось сохранить');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 text-sm">
      <label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={enabled}
          disabled={pending}
          onChange={(e) => void onChange(e.target.checked)}
          className="size-4 rounded border-zinc-300"
        />
        Автообновление раз в 3 дня
      </label>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
