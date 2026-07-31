import type { ReactNode } from 'react';

import type { IdeaDetail } from '@/lib/idea/get-detail';

type PlanDay = { day: number; tasks: string[] };

const LEVEL_LABEL: Record<string, string> = {
  low: 'низкая',
  medium: 'средняя',
  high: 'высокая',
};

function levelLabel(raw: string | null | undefined): string {
  if (!raw) return '—';
  return LEVEL_LABEL[raw.toLowerCase()] ?? raw;
}

function parsePlan(raw: unknown): PlanDay[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const day = (item as { day?: unknown }).day;
      const tasks = (item as { tasks?: unknown }).tasks;
      if (typeof day !== 'number' || !Array.isArray(tasks)) return null;
      return { day, tasks: tasks.map(String) };
    })
    .filter((x): x is PlanDay => x != null)
    .sort((a, b) => a.day - b.day);
}

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

function StringList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-zinc-500">—</span>;
  }
  return (
    <ul className="list-inside list-disc">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function BuildSection({ idea }: { idea: IdeaDetail }) {
  const plan = parsePlan(idea.fourteenDayBuildPlan);

  return (
    <section aria-labelledby="build-heading" className="flex flex-col gap-4">
      <h2
        id="build-heading"
        className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Как собрать
      </h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="Уверенность в сроках">
          {levelLabel(idea.buildTimeConfidence)}
        </Field>
        <Field label="Риск, что понадобится разработчик">
          {levelLabel(idea.riskOfDeveloperHelp)}
        </Field>
        <Field label="Главный технический риск">
          {idea.mainTechnicalRisk ?? '—'}
        </Field>
        <Field label="Нужные интеграции">
          <StringList items={idea.requiredIntegrations} />
        </Field>
        <Field label="Убрано, чтобы уложиться в срок">
          <StringList items={idea.featuresExcludedToFitDeadline} />
        </Field>
      </dl>

      <div>
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          План на 14 дней
        </h3>
        {plan.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">—</p>
        ) : (
          <ol className="mt-2 flex flex-col gap-3">
            {plan.map((day) => (
              <li key={day.day} className="text-sm">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  День {day.day}
                </p>
                <ul className="mt-1 list-inside list-disc text-zinc-700 dark:text-zinc-300">
                  {day.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
