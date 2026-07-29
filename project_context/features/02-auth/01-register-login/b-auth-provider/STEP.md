# Подшаг F1-01b — Auth provider

**Статус:** TODO  
**Родитель:** [../STEP.md](../STEP.md) · **После:** a-db-schema

## Цель

Настроить Auth.js (NextAuth v5) **или** Clerk; server session; API routes.

## Что сделать

### Auth.js path (рекомендация для monolith)

1. `npm i next-auth @auth/prisma-adapter bcryptjs`
2. `src/auth.ts` — config: Credentials provider, PrismaAdapter
3. `src/app/api/auth/[...nextauth]/route.ts`
4. `AUTH_SECRET` в `.env.example`
5. Hash password: bcrypt cost 10+

### Clerk path

1. `npm i @clerk/nextjs`
2. Middleware + `ClerkProvider` в layout
3. Sync user to local `users` on first login (webhook или onSession)

## DoD

- [ ] Register creates User row
- [ ] Login establishes session
- [ ] Session readable server-side (`auth()`)

## Журнал

- _(пусто)_
