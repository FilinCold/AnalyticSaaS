# AnalyticSaaS — AnalyticProject

Next.js application for the AnalyticSaaS MVP (AI-assisted micro-SaaS idea discovery).

Product requirements and architecture live in the repo root: [`../docs/`](../docs/).

## Prerequisites

- Node.js 20+
- npm or pnpm
- PostgreSQL 16+ (local install or Docker via `docker-compose.yml`)

## Setup

```bash
npm ci
cp .env.example .env.local
```

## Database setup

Start PostgreSQL with Docker (recommended for local dev):

```bash
docker compose up -d
```

Or point `DATABASE_URL` in `.env.local` at your own Postgres instance (see `.env.example`).

Apply migrations and generate the Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Verify the connection (requires `DATABASE_URL` in `.env.local` or the environment):

```bash
npm test -- prisma
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Dev server at [http://localhost:3010](http://localhost:3010) |
| `npm run build` | Production build |
| `npm run start` | Start production server on port 3010 |
| `npm test` | Vitest unit/smoke tests |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply pending Prisma migrations (`migrate deploy`) |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run inngest:dev` | Inngest Dev Server (sync with `/api/inngest`) |

```bash
npm run lint && npm test && npm run build
npm run dev
```

## Background jobs (Inngest)

Job runner: **Inngest** (see [`../docs/DECISIONS.md`](../docs/DECISIONS.md)).

Local development — two terminals:

```bash
# Terminal 1 — INNGEST_DEV=1 is set automatically by npm run dev
npm run dev

# Terminal 2
npm run inngest:dev
```

If you use `next start` or a custom dev command, add `INNGEST_DEV=1` to `.env.local` (see `.env.example`). Without it, `/api/inngest` returns 500.

Trigger the hello job manually (dev only):

```bash
curl -s -X POST http://localhost:3010/api/dev/trigger-hello \
  -H 'Content-Type: application/json' \
  -d '{"message":"hello from curl","runId":"manual-1"}'
```

Run job-related tests:

```bash
npm test -- -t job
```

Optional env vars (production / Inngest Cloud): `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` — see `.env.example`.

## Auth (Auth.js)

Email/password via Auth.js (NextAuth v5) + Prisma. Set `AUTH_SECRET` in `.env.local` (`openssl rand -base64 32`).

```bash
# after migrate
npm run dev
# open http://localhost:3010/register
```

API (`docs/API.md`):

| Method | Path |
|---|---|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/session` |

```bash
npm test -- auth
```

Health check (with dev server running):

```bash
curl -s http://localhost:3010/api/health
# {"ok":true}
```

## Project structure

```
AnalyticProject/
├── prisma/
│   ├── schema.prisma  # User + Auth.js tables (F1+)
│   └── migrations/
├── src/
│   ├── auth.ts        # Auth.js config
│   ├── app/           # App Router pages and API routes
│   │   ├── (auth)/    # /login, /register
│   │   ├── researches/
│   │   └── api/
│   │       ├── auth/         # register, login, logout, session, [...nextauth]
│   │       ├── health/
│   │       ├── inngest/
│   │       └── dev/trigger-hello/
│   ├── components/    # AppHeader, LogoutButton
│   ├── jobs/          # Inngest functions
│   ├── domain/        # Domain logic (from F4)
│   └── lib/           # prisma, inngest, auth helpers
├── docker-compose.yml
├── .env.example
├── eslint.config.mjs
├── vitest.config.ts
└── package.json
```

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Vitest for tests
- Prisma + PostgreSQL (F0-02+)
- Inngest job runner (F0-03+)
- Auth.js (NextAuth v5) + Credentials (F1-01+)

## Documentation

- [Architecture](../docs/ARCHITECTURE.md)
- [API contract](../docs/API.md)
- [Roadmap](../docs/ROADMAP.md)
- [MVP scope](../docs/MVP_SCOPE.md)
