import NextAuth from 'next-auth';

import { authConfig } from '@/auth.config';
import { protectRequest } from '@/lib/auth/guard';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth?.user?.id);
  return protectRequest(isLoggedIn, req.nextUrl.pathname, req.nextUrl.origin);
});

export const config = {
  matcher: [
    '/researches/:path*',
    '/api/researches/:path*',
    '/api/ideas/:path*',
    '/api/me',
  ],
};
