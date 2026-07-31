import type { IdeaDetail } from '@/lib/idea/get-detail';

const ATTRS: { key: keyof IdeaDetail; label: string }[] = [
  { key: 'primaryUser', label: 'Кто пользователь' },
  { key: 'problem', label: 'Проблема' },
  { key: 'inputDataType', label: 'Тип входных данных' },
  { key: 'mainAction', label: 'Главное действие' },
  { key: 'concreteResult', label: 'Конкретный результат' },
  { key: 'payReason', label: 'За что платят' },
];

export function OneJobSection({ idea }: { idea: IdeaDetail }) {
  return (
    <section aria-labelledby="one-job-heading" className="flex flex-col gap-4">
      <h2
        id="one-job-heading"
        className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Одна задача
      </h2>
      <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
        {idea.oneJobTemplate?.trim() || '—'}
      </p>
      <dl className="grid gap-3 sm:grid-cols-2">
        {ATTRS.map(({ key, label }) => (
          <div key={key}>
            <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {label}
            </dt>
            <dd className="mt-0.5 text-sm text-zinc-900 dark:text-zinc-50">
              {String(idea[key] ?? '—')}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
