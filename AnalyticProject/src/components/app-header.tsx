import Link from 'next/link';

import { auth } from '@/auth';
import { LogoutButton } from '@/components/logout-button';

export async function AppHeader() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        AnalyticSaaS
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {session?.user ? (
          <>
            <span className="text-zinc-600 dark:text-zinc-400">
              {session.user.email}
            </span>
            <Link href="/ideas" className="underline underline-offset-2">
              Идеи
            </Link>
            <Link
              href="/researches"
              className="text-zinc-500 underline underline-offset-2 dark:text-zinc-400"
            >
              Исследования
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login" className="underline underline-offset-2">
              Вход
            </Link>
            <Link href="/register" className="underline underline-offset-2">
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
