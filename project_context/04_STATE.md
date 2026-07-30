# STATE — где мы остановились

**Проект/фича:** AnalyticSaaS — **F1-02 DONE**; следующий шаг **F2-01 Research model**
**Последнее обновление:** `2026-07-29` — F1-02: middleware + `/api/me` + `(app)` guard; T1–T4 green

## Как продолжить в новом чате

**Для реализации (когда будет команда):**

> Прочитай `project_context/04_STATE.md`. Начни реализацию `project_context/features/03-research/01-model-crud/STEP.md`. Код только по этому шагу.

**Для ревью плана:**

> Прочитай `project_context/features/README.md` и `docs/API.md`. Дай feedback по детализации; код не писать.

**Порядок чтения агента при реализации:**  
`04_STATE.md` → текущий `STEP.md` (+ подшаги) → `docs/API.md` / `LLM_CONTRACT.md` / `IDEA_CARD_SPEC.md` по шагу → `docs/DECISIONS.md`.

## На чём остановились

### ✅ Сделано

1. **Аудит доков** — коллизии в `docs/DECISIONS.md`.
2. **Дерево features** — 9 эпиков, 24 шага.
3. **Детализация R4** — все `STEP.md` расширены: подзадачи, «Не входит», API/поля, тест-кейсы, блокеры.
4. **Подшаги** — 15 вложенных карточек в F0-01, F0-03, F1-01, F5-03, F6-02.
5. **Новые SSOT:** `docs/API.md`, `docs/LLM_CONTRACT.md`, `docs/IDEA_CARD_SPEC.md`.
6. **Шаблон** — `project_context/step-TEMPLATE.md` обновлён.
7. **F0-01a** — Next.js scaffold в `AnalyticProject/` (dev **:3010**, build OK).
8. **F0-01b** — ESLint + Prettier + Vitest; smoke test; `npm run lint` / `npm test` OK.
9. **F0-01c** — placeholder home, `GET /api/health`, README, `.env.example`; T4–T5 OK.
10. **Git baseline** — root `.gitignore`; initial commit `9dba64f`; `main` → `origin/main` на GitHub.
11. **F0-02** — Prisma 6 + PostgreSQL baseline; singleton client; docker-compose; smoke test; lint/test/build OK.
12. **Локальная БД** — PostgreSQL 16 через Homebrew; user/db `analyticsaas`; T1–T4 пройдены.
13. **F0-03** — Inngest job runner; hello job enqueue/process; `INNGEST_DEV=1`; lint/test/build OK.
14. **F1-01** — Auth.js Credentials + JWT (без PrismaAdapter); User schema; register/login/logout/session; UI; T7 browser OK.
15. **F1-02** — API protection: middleware, `getSessionUser`/`requireAuth`, `GET /api/me`, `(app)` layout; T1–T4 OK.

### ⏳ Следующая задача

**F2-01 — Модель Research:** `project_context/features/03-research/01-model-crud/STEP.md`

### ❌ Не начато

- F2-01 Research model (следующий), F2+, остальные шаги.

## Прогресс F0-01 (каркас приложения)

| Подшаг | Статус | Проверка |
|---|---|---|
| a-next-init | ✅ DONE | build OK, dev `:3010` |
| b-tooling | ✅ DONE | lint OK, smoke test |
| c-smoke-readme | ✅ DONE | `/` + `/api/health` OK |

**Тест-кейсы родительского F0-01:**

| # | Сценарий | Статус |
|---|---|---|
| T1 | `npm test` | ✅ |
| T2 | `npm run lint` | ✅ |
| T3 | `npm run build` | ✅ |
| T4 | dev + `/` placeholder | ✅ |
| T5 | `GET /api/health` | ✅ |

**Проверено** `2026-07-29`: `npm run lint && npm test && npm run build`; curl `/` и `/api/health` — OK.

## Прогресс F0-02 (Prisma + PostgreSQL)

| Подзадача | Статус | Проверка |
|---|---|---|
| deps + schema | ✅ DONE | `prisma/schema.prisma` (пустая, без domain models) |
| baseline migration | ✅ DONE | `prisma/migrations/20260729130000_init/` |
| prisma singleton | ✅ DONE | `src/lib/prisma.ts` |
| docker-compose + docs | ✅ DONE | `docker-compose.yml`, README, `.env.example` |
| smoke test | ✅ DONE | `prisma.test.ts` (`SELECT 1` на локальной БД) |

**Тест-кейсы F0-02:**

| # | Сценарий | Статус |
|---|---|---|
| T1 | Чистая БД + `migrate deploy` | ✅ |
| T2 | `prisma generate` | ✅ |
| T3 | Import `prisma` + `SELECT 1` | ✅ |
| T4 | Повторный `migrate deploy` | ✅ idempotent |

**Проверено** `2026-07-29`: brew Postgres 16; `migrate deploy` ×2; `npm test -- prisma` (SELECT 1); lint/test/build OK.

## Прогресс F0-03 (Job runner skeleton)

| Подзадача | Статус | Проверка |
|---|---|---|
| a-choose-runner | ✅ DONE | Inngest 4.x; client + `/api/inngest` |
| b-hello-job | ✅ DONE | `app/hello` event; dev trigger |
| c-integration-tests | ✅ DONE | `npm test -- -t job` green |

**Тест-кейсы F0-03:**

| # | Сценарий | Статус |
|---|---|---|
| T1 | Enqueue hello job | ✅ |
| T2 | Process hello | ✅ |
| T3 | `npm test -- -t job` | ✅ |
| T4 | Dev: дважды enqueue | ✅ (нужен `npm run inngest:dev` на :8288) |

**Проверено** `2026-07-29`: Inngest ^4.13; lint/test/build OK; hello job handler + enqueue tests green.  
**Verify вручную:** `GET /api/inngest` → `mode:"dev"` + `function_count:1`; trigger без Dev Server → 502 с hint; с `inngest:dev` → enqueue OK.

## Прогресс F1-01 (Auth register/login)

| Подзадача | Статус | Проверка |
|---|---|---|
| a-db-schema | ✅ DONE | User + Account/Session/VerificationToken; migrate `add_users` |
| b-auth-provider | ✅ DONE | Auth.js v5 Credentials + JWT (no PrismaAdapter); bcrypt; API |
| c-login-register-ui | ✅ DONE | `/login`, `/register`, header logout, `/researches` placeholder |

**Тест-кейсы F1-01:**

| # | Сценарий | Статус |
|---|---|---|
| T1 | register valid | ✅ |
| T2 | register duplicate | ✅ 409 |
| T3 | login valid | ✅ |
| T4 | login wrong password | ✅ 401 |
| T5 | GET session with user | ✅ |
| T6 | GET session without | ✅ 401 |
| T7 | Manual browser Flow A | ✅ владелец подтвердил |

**Проверено** `2026-07-29`: migrate `add_users`; `npm test` 18 passed; lint/build OK; browser register/login → `/researches`.  
**Fix note:** stale PrismaClient после migrate → рестарт `npm run dev`; PrismaAdapter убран (конфликт с Credentials + `password_hash`).

## Прогресс F1-02 (API protection)

| Подзадача | Статус | Проверка |
|---|---|---|
| get-session helper | ✅ DONE | `getSessionUser` + `requireAuth` |
| middleware | ✅ DONE | edge `auth.config`; page→login, API→401 |
| GET `/api/me` | ✅ DONE | stub для T1–T2 |
| `(app)` layout | ✅ DONE | SSR redirect без session |
| tests | ✅ DONE | `auth-guard.test.ts` |

**Тест-кейсы F1-02:**

| # | Сценарий | Статус |
|---|---|---|
| T1 | GET `/api/me` без session | ✅ 401 |
| T2 | GET `/api/me` с session | ✅ 200 |
| T3 | anonymous page → `/login?callbackUrl=` | ✅ |
| T4 | matcher не трогает login/auth/health | ✅ |
| T5 | POST research без cookie | ⏳ после F2-01 |

**Проверено** `2026-07-29`: `npm test` 23 passed; lint/build OK.  
**Note:** Next 16 warns middleware→proxy; оставили `middleware.ts` по STEP. Auth split: `auth.config.ts` (edge) + `auth.ts` (Credentials/Prisma).

## Код в `AnalyticProject/`

| Компонент | Версия / детали |
|---|---|
| Next.js | 16.2.12 (App Router, `src/`) |
| React | 19.2.4 |
| Tailwind | v4 |
| Vitest | 4.1.10, alias `@/` |
| Prettier | semi + singleQuote |
| Prisma | 6.19.x |
| Inngest | 4.13.x |
| Auth.js | next-auth@5 beta.32 |
| Scripts | `dev`, `build`, `start`, `lint`, `test`, `db:migrate`, `db:generate`, `inngest:dev` |

**Ключевые файлы (созданы):**

- `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`
- `src/lib/index.ts`, `src/lib/smoke.test.ts`
- `src/lib/prisma.ts`, `src/lib/prisma.test.ts`
- `src/lib/inngest/client.ts`
- `src/lib/auth/*` (password, register, credentials, errors, get-session, guard)
- `src/auth.ts`, `src/auth.config.ts`, `src/types/next-auth.d.ts`
- `src/middleware.ts`
- `src/jobs/hello.ts`, `src/jobs/hello.job.test.ts`, `src/jobs/index.ts`
- `src/app/api/inngest/route.ts`
- `src/app/api/dev/trigger-hello/route.ts`, `route.test.ts`
- `src/app/api/auth/{register,login,logout,session,[...nextauth]}/`
- `src/app/api/me/route.ts`
- `src/app/(auth)/{login,register}/page.tsx`
- `src/app/(app)/layout.tsx`, `src/app/(app)/researches/page.tsx`
- `src/components/{app-header,logout-button}.tsx`
- `prisma/schema.prisma`, `prisma/migrations/`
- `docker-compose.yml`
- `src/app/layout.tsx`, `src/app/page.tsx`
- `src/app/api/health/route.ts`, `route.test.ts`
- `README.md`, `.env.example`

**Ещё нет:** `src/domain/` (F4), Research CRUD (F2)

## Фазы проекта

| Фаза | Статус | Что дальше |
|---|---|---|
| Сбор требований (Части 1–5) | ✅ DONE | — |
| Архитектура + roadmap | ✅ DONE | — |
| Закрытие коллизий доков | ✅ DONE | `DECISIONS.md` |
| Разбивка features (каркас 9×24) | ✅ DONE | `project_context/features/` |
| **Детализация STEP.md (R4)** | **✅ DONE** | `2026-07-29` |
| Ревью владельцем | ✅ DONE | «ок, к реализации» `2026-07-29` |
| **F0-01 app scaffold** | **✅ DONE** | a–c `2026-07-29` |
| **F0-02 Prisma** | **✅ DONE** | `2026-07-29` |
| **F0-03 Job runner** | **✅ DONE** | `2026-07-29` |
| **F1-01 Auth** | **✅ DONE** | `2026-07-29` |
| **F1-02 API protection** | **✅ DONE** | `2026-07-29` |
| F2-01 Research model | ⏳ TODO | следующий шаг |
| F2+ | ❌ | после F2-01 |

## Внешние гейты / блокеры

- F3-02: три адаптера (HN → PH → Reddit) — больше работы, чем в исходном F3-02 «один адаптер».
- Git: `git@github.com:FilinCold/AnalyticSaaS.git`, ветка `main` (`9dba64f`), tracking `origin/main`.

## Текущий следующий шаг

**F2-01 Research model:**  
`project_context/features/03-research/01-model-crud/STEP.md`

## Доска статусов

| Эпик/# | Шаг | Статус | Завершён |
|---|---|---|---|
| R0 | Протокол требований | DONE | 2026-07-29 |
| R1-01..05 | Части 1–5 ТЗ | DONE | 2026-07-29 |
| R2 | Архитектура + roadmap | DONE | 2026-07-29 |
| R3 | Коллизии + features tree (каркас) | DONE | 2026-07-29 |
| R4 | Детализация STEP.md + API/LLM/IDEA specs | **DONE** | 2026-07-29 |
| F0-01 | Каркас приложения | **DONE** | 2026-07-29 |
| F0-02 | Prisma + PostgreSQL | **DONE** | 2026-07-29 |
| F0-03 | Job runner | **DONE** | 2026-07-29 |
| F1-01 | Auth register/login | **DONE** | 2026-07-29 |
| F1-02 | API protection | **DONE** | 2026-07-29 |
| F2-01 | Research model | TODO | — |
| 01–09 | Реализация по features/ | IN PROGRESS | F1-02 DONE |

## Журнал

- `2026-07-29` — Структура, протокол, Части 1–5 зафиксированы.
- `2026-07-29` — Синтез: VISION…ROADMAP, формулы скоров, MVP scope, фичи F0–F8.
- `2026-07-29` — Аудит: коллизии; `project_context/features/` 9×24 базовых STEP.md.
- `2026-07-29` — **R4:** детализация 24 STEP.md + 15 подшагов; `API.md`, `LLM_CONTRACT.md`, `IDEA_CARD_SPEC.md`.
- `2026-07-29` — **F0-01a:** Next.js scaffold в `AnalyticProject/` (src/, @/*, lib/); build OK; dev **:3010**.
- `2026-07-29` — **F0-01b:** Prettier, eslint-config-prettier, Vitest, smoke test; lint/test OK.
- `2026-07-29` — **F0-01c:** placeholder UI, health endpoint, README, `.env.example`; T4–T5 OK; **F0-01 закрыт**.
- `2026-07-29` — **Git:** root `.gitignore`; `lint/test/build` OK; commit `9dba64f`; push `main` → `origin/main` (FilinCold/AnalyticSaaS).
- `2026-07-29` — **F0-02:** Prisma 6, baseline migration, singleton, docker-compose, README; lint/test/build OK.
- `2026-07-29` — **F0-02 verify:** brew `postgresql@16`; user/db `analyticsaas`; T1–T4 OK; **F0-02 закрыт**.
- `2026-07-29` — **F0-03:** Inngest 4.x; hello job; `INNGEST_DEV=1`; tests; **F0-03 закрыт**.
- `2026-07-29` — **F1-01:** Auth.js Credentials; User migrate; `/login` `/register`; session API; **F1-01 закрыт**.
- `2026-07-29` — **F1-01 verify:** browser OK; убран PrismaAdapter; note «после prisma migrate — рестарт dev».
- `2026-07-29` — **F1-02:** middleware + `/api/me` + helpers + `(app)` layout; edge `auth.config`; T1–T4; **F1-02 закрыт**.
