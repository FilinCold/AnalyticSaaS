import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from '@/auth.config';
import { authenticateUser } from '@/lib/auth/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Credentials + passwordHash: manage User ourselves (no PrismaAdapter).
  // Adapter tables remain in schema for future OAuth.
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== 'string' || typeof password !== 'string') {
          return null;
        }

        const user = await authenticateUser(email, password);
        if (!user) {
          return null;
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
});
