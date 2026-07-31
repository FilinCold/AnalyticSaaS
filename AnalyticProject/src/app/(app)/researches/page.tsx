import Link from 'next/link';

import { getSessionUser } from '@/lib/auth/get-session';
import { prisma } from '@/lib/prisma';
import { labelResearchStatus } from '@/lib/research/status-labels';

function formatDate(value: Date): string {
  return value.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function ResearchesPage() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  const researches = await prisma.research.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Исследования</h1>
        <Link
          href="/researches/new"
          className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Новое исследование
        </Link>
      </div>

      {researches.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded border border-dashed border-zinc-300 px-4 py-10 dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            Создайте первое исследование
          </p>
          <Link
            href="/researches/new"
            className="text-sm font-medium underline underline-offset-2"
          >
            Создать исследование
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-2 py-2 font-medium">Название</th>
                <th className="px-2 py-2 font-medium">Тема</th>
                <th className="px-2 py-2 font-medium">Статус</th>
                <th className="px-2 py-2 font-medium">Создано</th>
              </tr>
            </thead>
            <tbody>
              {researches.map((research) => (
                <tr
                  key={research.id}
                  className="border-b border-zinc-100 dark:border-zinc-900"
                >
                  <td className="px-2 py-3">
                    <Link
                      href={`/researches/${research.id}`}
                      className="font-medium underline underline-offset-2"
                    >
                      {research.title}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {research.topic}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {labelResearchStatus(research.status)}
                  </td>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-300">
                    {formatDate(research.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
