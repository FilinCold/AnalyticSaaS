import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-4 px-8 py-24 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          AnalyticSaaS
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          AI-assisted micro-SaaS idea discovery
        </p>
        <div className="mt-2 flex gap-4 text-sm">
          <Link href="/login" className="underline underline-offset-2">
            Log in
          </Link>
          <Link href="/register" className="underline underline-offset-2">
            Register
          </Link>
        </div>
      </main>
    </div>
  );
}
