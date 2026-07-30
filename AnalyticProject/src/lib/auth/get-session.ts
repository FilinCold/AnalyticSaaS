import { auth } from '@/auth';

import type { AuthUser } from './register';

export async function getSessionUser(): Promise<AuthUser | null> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
  };
}

/** Returns current user, or a 401 JSON Response when anonymous. */
export async function requireAuth(): Promise<AuthUser | Response> {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: 'Не авторизован' }, { status: 401 });
  }

  return user;
}
