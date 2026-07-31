import type { ReactNode } from 'react';

import type { IdeaDetail } from '@/lib/idea/get-detail';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-zinc-900 dark:text-zinc-50">{children}</dd>
    </div>
  );
}

export function SalesSection({ idea }: { idea: IdeaDetail }) {
  return (
    <section aria-labelledby="sales-heading" className="flex flex-col gap-4">
      <h2
        id="sales-heading"
        className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Как продавать
      </h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="Первый клиент">
          {idea.firstCustomerPersona ?? '—'}
        </Field>
        <Field label="Где искать клиентов">
          {idea.whereToFindCustomers ?? '—'}
        </Field>
        <Field label="Формулировка боли">{idea.painStatement ?? '—'}</Field>
        <Field label="Короткое предложение">{idea.shortOffer ?? '—'}</Field>
        <Field label="Канал привлечения">
          {idea.primaryAcquisitionChannel ?? '—'}
        </Field>
        <Field label="Как показать результат">
          {idea.howToShowResult ?? '—'}
        </Field>
        <Field label="Призыв к действию">{idea.recommendedCta ?? '—'}</Field>
        <Field label="Цена">{idea.simplePrice ?? '—'}</Field>
        <Field label="Как взять первую оплату">
          {idea.howToGetFirstPayment ?? '—'}
        </Field>
      </dl>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded border border-zinc-200 px-3 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Когда продолжать
          </h3>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {idea.continueCriteria ?? '—'}
          </p>
        </div>
        <div className="rounded border border-zinc-200 px-3 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Когда остановиться
          </h3>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {idea.stopCriteria ?? '—'}
          </p>
        </div>
      </div>
    </section>
  );
}
