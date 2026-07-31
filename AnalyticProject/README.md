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
| `npm run test:e2e` | Playwright Flow A (mock LLM; starts Next + Inngest) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply pending Prisma migrations (`migrate deploy`) |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run inngest:dev` | Inngest Dev Server (sync with `/api/inngest`) |

```bash
npm run lint && npm test && npm run build
npm run dev
```

## E2E (F8-01 Flow A)

Playwright automates the manual happy path on **mock LLM** (no live keys, no cron / Flow A2).

Prerequisites: Postgres with migrations applied, `.env.local` with `DATABASE_URL` + `AUTH_SECRET`.

```bash
npx playwright install chromium   # once
LLM_PROVIDER=mock ADAPTER_MODE=mock npm run test:e2e
```

What `test:e2e` does:

1. Starts Next (`:3010`) and Inngest Dev Server (`:8288`) unless already running (`reuseExistingServer` locally).
2. Resets the shared **system feed** Research (signals / ideas / pipeline runs) so auto-initial can fire.
3. Registers a user → `/ideas` → **Обновить ленту** (mock adapters) → waits for pipeline `succeeded` → opens an idea card and asserts One Job / Opportunity / «Когда продолжать».

Optional env: `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, `E2E_BASE_URL` (see `.env.example`).

**CI note:** needs a Postgres service container (or reachable `DATABASE_URL`), Chromium install, and both webServers. Without a CI DB, run e2e only locally. GitHub Actions example shape: `services: postgres` + `npx playwright install --with-deps chromium` + `LLM_PROVIDER=mock npm run test:e2e`.

T2 (no LLM secrets in client) lives in Vitest: `npm test -- -t "LLM client bundle"`.

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

## LLM client (F5-02)

Server-only wrapper under `src/lib/llm/`. **По умолчанию mock** (бесплатно, без ключей).

### Рекомендуемый live-путь: OpenRouter (pay-as-you-go)

Подходит, если нужен расход **только за токены** (без подписки ChatGPT) и удобная оплата баланса (в т.ч. из РФ — смотри актуальные методы на сайте OpenRouter).

1. Зарегистрируйся на [openrouter.ai](https://openrouter.ai), пополни баланс.
2. Создай API key.
3. В `.env.local` (не коммить):

```bash
LLM_PROVIDER=openrouter
LLM_API_KEY=sk-or-v1-...          # ключ OpenRouter
LLM_MODEL=openai/gpt-4o-mini      # slug модели у OpenRouter
# LLM_BASE_URL по умолчанию https://openrouter.ai/api/v1
```

4. Перезапусти `npm run dev`. Pipeline и rescore работают на mock без ключа; live — только с OpenRouter/OpenAI key.

Прямой OpenAI API тоже поддерживается: `LLM_PROVIDER=openai` + `LLM_MODEL=gpt-4o-mini` (без OpenRouter slug).

```bash
LLM_PROVIDER=mock npm test -- -t llm
```

**T3 — secrets must not ship to the client bundle:** never import `@/lib/llm` (or `LLM_API_KEY`) from Client Components / files with `'use client'`. Quick check:

```bash
# expect no matches under client components
rg -n "from '@/lib/llm'|LLM_API_KEY|LLM_PROVIDER" src/components src/app --glob '*.tsx'
```

Fixtures: `fixtures/llm/*.json`.

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
│   ├── schema.prisma  # User, Research, Signal, Idea, PipelineRun, …
│   └── migrations/
├── src/
│   ├── auth.ts / auth.config.ts
│   ├── app/           # App Router: (auth), (app)/ideas|researches, api/*
│   ├── adapters/      # HN / PH / Reddit + mock
│   ├── components/    # Ideas feed/card, research, pipeline UI
│   ├── domain/        # scoring, pipeline helpers, types
│   ├── jobs/          # pipeline.run, schedule-refresh, idea.rescore, hello
│   └── lib/           # prisma, inngest, auth, llm, idea, pipeline, validation
├── e2e/               # Playwright Flow A (F8-01)
├── fixtures/llm/      # Mock LLM JSON fixtures
├── docker-compose.yml
├── playwright.config.ts
├── .env.example
└── package.json
```

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Vitest for unit/integration tests; Playwright for E2E (F8-01)
- Prisma + PostgreSQL (F0-02+)
- Inngest job runner (F0-03+)
- Auth.js (NextAuth v5) + Credentials / JWT (F1-01+)
- OpenRouter / OpenAI LLM client + Mock (F5-02+)

## Known limitations

См. root [`../README.md`](../README.md) § Known limitations. Кратко: нет production deploy; live LLM/adapters нуждаются в keys; Inngest Dev обязателен для pipeline; rescore без LLM; cron вне Playwright Flow A.

## Documentation

- [Root README (quick start)](../README.md)
- [Architecture](../docs/ARCHITECTURE.md)
- [API contract](../docs/API.md)
- [Acceptance](../docs/ACCEPTANCE_CRITERIA.md)
- [Roadmap](../docs/ROADMAP.md)
- [MVP scope](../docs/MVP_SCOPE.md)
