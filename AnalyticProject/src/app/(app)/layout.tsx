import { redirect } from 'next/navigation';

import { getSessionUser } from '@/lib/auth/get-session';

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?callbackUrl=%2Fresearches');
  }

  return children;
}
