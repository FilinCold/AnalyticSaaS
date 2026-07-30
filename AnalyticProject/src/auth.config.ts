import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js config (no Prisma / Credentials authorize).
 * Used by middleware; full providers live in auth.ts.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
