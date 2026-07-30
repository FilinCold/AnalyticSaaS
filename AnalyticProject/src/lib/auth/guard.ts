import { NextResponse } from 'next/server';

/** Paths guarded by middleware (pages + APIs). Public auth/health stay out. */
export const middlewareMatcher = [
  '/ideas',
  '/ideas/:path*',
  '/researches/:path*',
  '/api/researches/:path*',
  '/api/ideas',
  '/api/ideas/:path*',
  '/api/me',
] as const;

/**
 * Anonymous page → redirect /login?callbackUrl=…
 * Anonymous API → 401 JSON
 * Authenticated → next
 */
export function protectRequest(
  isLoggedIn: boolean,
  pathname: string,
  origin: string,
): NextResponse {
  if (isLoggedIn) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
}
