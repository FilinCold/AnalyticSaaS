import Link from 'next/link';

import { ResearchForm } from '@/components/research/ResearchForm';

export default function NewResearchPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-12">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/researches" className="underline underline-offset-2">
            Исследования
          </Link>
          {' / '}
          Новое
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Новое исследование
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Тема и ключевые слова для поиска сигналов.
        </p>
      </div>

      <ResearchForm />
    </main>
  );
}
