import Link from 'next/link';

export default function IdeaNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Не найдено</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Идея не существует или у вас нет доступа.
      </p>
      <Link
        href="/ideas"
        className="text-sm font-medium underline underline-offset-2"
      >
        К ленте идей
      </Link>
    </main>
  );
}
