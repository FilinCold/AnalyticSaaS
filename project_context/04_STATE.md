# STATE — где мы остановились

**Проект/фича:** AnalyticSaaS — **F3-02 DONE**; следующий шаг **F4-01 Score formulas**  
**Последнее обновление:** `2026-07-31` — F3-02 Source adapters (HN/PH/Reddit → system feed); next F4-01; ветка `TASK-3@signals`

## Как проверить текущие правки (owner)

Dev должен быть на **:3010** (`cd AnalyticProject && npm run dev`). Health: `curl http://localhost:3010/api/health` → `{"ok":true}`.

### A. Автотесты

```bash
cd AnalyticProject
npm run lint && npm test && npm run build
```

Ожидание: lint OK; **49** tests passed; build с роутами `/ideas`, `/api/ideas`, `/api/ideas/ingest`, `/api/researches/[id]/signals/ingest`.

### B. Браузер — pivot + F2-03 (главное) · UI на русском

1. Открой http://localhost:3010/login → войди (или зарегистрируй нового).
2. После входа должен открыться **`/ideas`** (не `/researches`).
3. На странице: заголовок **Идеи**, статистика, empty state, кнопка **Обновить ленту**.
4. В шапке: **Идеи** primary, **Исследования** secondary, **Выйти**.
5. Анонимно открой http://localhost:3010/ideas → редирект на login с `callbackUrl=/ideas`.
6. Страницы **Вход** / **Регистрация** — тексты на русском.

### C. Secondary Research (F2-02 ещё жив)

1. Из Идеи → «исследования» / nav **Исследования** → `/researches`.
2. **Новое исследование** → название + тема → Создать → detail: секция **Сигналы** + плейсхолдер Идеи.
3. Список показывает созданную запись (колонки на русском).
4. На detail добавь ≥3 сигнала → счётчик и список preview обновляются.

### D. API smoke (опционально)

```bash
curl -s -b cookies.txt http://localhost:3010/api/ideas
# → {"ideas":[],"stats":{…zeros…}}

curl -s -b cookies.txt -X POST http://localhost:3010/api/ideas/ingest
# → {"researchId":"…","ingestedCount":6,…}  (ADAPTER_MODE=mock)
```

### E. F3-01 Signals (API / UI secondary)

1. На research detail добавь сигнал → появляется в списке, `sourceType=manual`.
2. Пустой текст / >50000 символов → ошибка валидации.
3. `npm test -- -t signal` → T1–T5 green.

### F. F3-02 Adapters (лента)

1. `/ideas` → **Обновить ленту** → «Добавлено сигналов: N» (mock: 6).
2. Повторный клик → «Добавлено сигналов: 0» (dedup).
3. `ADAPTER_MODE=mock npm test -- -t "ingest|adapter"` → green.

### G. Что ещё не проверяем (нормально)

Идей-карточек в ленте нет до F6 (ingest только Signal rows). Pipeline/scoring — F4/F5.

---

## Как продолжить в новом чате

**Для реализации (когда будет команда):**

> Прочитай `project_context/04_STATE.md` и `docs/DECISIONS.md` § 2026-07-30. Начни реализацию `project_context/features/05-scoring-domain/01-score-formulas/STEP.md`. Код только по этому шагу.

**Для ревью плана:**

> Прочитай `project_context/features/README.md` и `docs/AI_PIPELINE.md`. Дай feedback по детализации; код не писать.

**Порядок чтения агента при реализации:**  
`04_STATE.md` → текущий `STEP.md` (+ подшаги) → `docs/API.md` / `LLM_CONTRACT.md` / `IDEA_CARD_SPEC.md` по шагу → `docs/DECISIONS.md`.

## На чём остановились

### ✅ Сделано

1. **Аудит доков** — коллизии в `docs/DECISIONS.md`.
2. **Дерево features** — 9 эпиков, 24+ шага (+ F2-03).
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
16. **F2-01** — Research Prisma model; zod validation; CRUD `/api/researches`; ownership 404; T1–T7 OK.
17. **F2-02** — Research UI secondary; T1–T4 smoke OK.
18. **UX pivot 2026-07-30** — лента идей (news-portal); Research = internal system feed; SSOT обновлён.
19. **F2-03** — `/ideas` feed shell + stats + `GET /api/ideas` stub; login→ideas; T1–T4 OK.
20. **F3-01** — Signal Prisma model; GET/POST `/api/researches/[id]/signals`; ManualSignalForm; maybeTrigger stub; T1–T5 OK.
21. **F3-02** — HN/PH/Reddit adapters + mock; system feed; `POST /api/ideas/ingest`; UI «Обновить ленту»; T1–T4 OK.

### ⏳ Следующая задача

**F4-01 — Score formulas (unit):** `project_context/features/05-scoring-domain/01-score-formulas/STEP.md`

### ❌ Не начато

- F4+, остальные шаги.

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
| T5 | POST research без cookie | ✅ (F2-01 T7) |

**Проверено** `2026-07-29`: `npm test` 23 passed; lint/build OK.  
**Note:** Next 16 warns middleware→proxy; оставили `middleware.ts` по STEP. Auth split: `auth.config.ts` (edge) + `auth.ts` (Credentials/Prisma).

## Прогресс F2-01 (Research model + CRUD)

| Подзадача | Статус | Проверка |
|---|---|---|
| Prisma model | ✅ DONE | `Research` + migrate `add_researches` |
| Validation | ✅ DONE | `src/lib/validation/research.ts` (zod) |
| API routes | ✅ DONE | list/create + get/patch by id |
| Ownership | ✅ DONE | чужой id → 404 |
| tests | ✅ DONE | `research.api.test.ts` T1–T7 |

**Тест-кейсы F2-01:**

| # | Сценарий | Статус |
|---|---|---|
| T1 | POST create valid | ✅ 201, status=draft |
| T2 | POST без title | ✅ 400 |
| T3 | GET list | ✅ только свои |
| T4 | GET чужой id | ✅ 404 |
| T5 | PATCH свой | ✅ 200 |
| T6 | PATCH чужой | ✅ 404 |
| T7 | Аноним POST | ✅ 401 |

**Проверено** `2026-07-30`: migrate deploy; `vitest -t research` 7/7; full suite 30 passed; lint/build OK.

## Прогресс F2-02 (Research UI list/create)

| Подзадача | Статус | Проверка |
|---|---|---|
| App layout / header nav | ✅ DONE | `(app)` session + `AppHeader` Researches |
| List page | ✅ DONE | SSR prisma; table + empty state |
| Create flow | ✅ DONE | `/researches/new` + `ResearchForm` |
| Detail shell | ✅ DONE | fields + Signals/Ideas placeholders |
| 404 ownership | ✅ DONE | `not-found.tsx` |
| keywords helper + unit tests | ✅ DONE | `keywords.test.ts` |

**Тест-кейсы F2-02:**

| # | Сценарий | Статус |
|---|---|---|
| T1 | List пустой | ✅ empty state HTML |
| T2 | Create valid | ✅ detail shows title/topic |
| T3 | Create без title | ✅ HTML required + API 400 |
| T4 | Чужой/missing id | ✅ 404 page |
| T5 | Manual Flow A 1–2 | ⏳ owner checklist |

**Проверено** `2026-07-30`: lint OK; `npm test` 33 passed; build OK (routes `/researches`, `/new`, `/[researchId]`); HTTP smoke T1–T4.

## Прогресс F2-03 (Ideas feed shell)

| Подзадача | Статус | Проверка |
|---|---|---|
| `/ideas` page + stats | ✅ DONE | empty feed, no create Research CTA |
| `GET /api/ideas` stub | ✅ DONE | auth + empty stats |
| login/register → `/ideas` | ✅ DONE | callbackUrl |
| Nav Ideas primary | ✅ DONE | Researches secondary |
| middleware `/ideas` | ✅ DONE | |

**Тест-кейсы F2-03:** T1–T4 ✅; T5 ⏳ owner — см. «Как проверить текущие правки» § B

**Проверено** `2026-07-30`: lint OK; `npm test` 35 passed; build OK (`/ideas`, `/api/ideas`). Owner checklist в шапке STATE.

## Прогресс F3-01 (Signal + manual create)

| Подзадача | Статус | Проверка |
|---|---|---|
| Prisma Signal + migrate | ✅ DONE | `add_signals` |
| GET/POST signals API | ✅ DONE | ownership 404; max 50k |
| ManualSignalForm UI | ✅ DONE | research detail |
| maybeTriggerInitialPipeline | ✅ DONE | no-op stub F5-05 |
| tests T1–T5 | ✅ DONE | `vitest -t signal` |

**Тест-кейсы F3-01:** T1–T5 ✅; T6 ⏳ owner browser (≥3 signals на detail)

**Проверено** `2026-07-30`: migrate deploy; lint OK; `npm test` 40 passed; build OK (`/api/researches/[id]/signals`).

## Прогресс F3-02 (Source adapters)

| Подзадача | Статус | Проверка |
|---|---|---|
| Adapter interface + mock | ✅ DONE | `src/adapters/` |
| HN / PH / Reddit live | ✅ DONE | Algolia; PH/Reddit env keys |
| System feed helper | ✅ DONE | `topic=__system_feed__` |
| Ingest + dedup | ✅ DONE | `domain/signals/ingest.ts` |
| `POST /api/ideas/ingest` | ✅ DONE | primary for feed |
| Research ingest API | ✅ DONE | ownership 404 |
| UI «Обновить ленту» | ✅ DONE | `/ideas` |
| tests T1–T4 | ✅ DONE | ingest + adapter-config |

**Тест-кейсы F3-02:** T1–T4 ✅; T5 ⏳ owner browser

**Проверено** `2026-07-31`: lint OK; `npm test` 49 passed; build OK (`/api/ideas/ingest`, signals/ingest).

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
| Zod | 3.25.x |
| Scripts | `dev`, `build`, `start`, `lint`, `test`, `db:migrate`, `db:generate`, `inngest:dev` |

**Ключевые файлы (созданы):**

- `eslint.config.mjs`, `.prettierrc`, `vitest.config.ts`
- `src/lib/index.ts`, `src/lib/smoke.test.ts`
- `src/lib/prisma.ts`, `src/lib/prisma.test.ts`
- `src/lib/inngest/client.ts`
- `src/lib/auth/*` (password, register, credentials, errors, get-session, guard)
- `src/lib/validation/research.ts`, `signal.ts`
- `src/lib/research/serialize.ts`
- `src/lib/signal/serialize.ts`, `hash.ts`, `system-feed.ts`
- `src/lib/pipeline/maybe-trigger-initial.ts`
- `src/adapters/` (types, mock, hackernews, producthunt, reddit, index)
- `src/domain/signals/ingest.ts`
- `src/auth.ts`, `src/auth.config.ts`, `src/types/next-auth.d.ts`
- `src/middleware.ts`
- `src/jobs/hello.ts`, `src/jobs/hello.job.test.ts`, `src/jobs/index.ts`
- `src/app/api/inngest/route.ts`
- `src/app/api/dev/trigger-hello/route.ts`, `route.test.ts`
- `src/app/api/auth/{register,login,logout,session,[...nextauth]}/`
- `src/app/api/me/route.ts`
- `src/app/api/researches/route.ts`, `[researchId]/route.ts`, `research.api.test.ts`
- `src/app/api/researches/[researchId]/signals/route.ts`, `signal.api.test.ts`
- `src/app/api/researches/[researchId]/signals/ingest/route.ts`
- `src/app/api/ideas/route.ts`, `ideas.api.test.ts`
- `src/app/api/ideas/ingest/route.ts`
- `src/app/(auth)/{login,register}/page.tsx`
- `src/app/(app)/layout.tsx`, `src/app/(app)/ideas/page.tsx`
- `src/app/(app)/researches/page.tsx`
- `src/app/(app)/researches/new/page.tsx`
- `src/app/(app)/researches/[researchId]/page.tsx`, `not-found.tsx`
- `src/components/{app-header,logout-button}.tsx`
- `src/components/research/ResearchForm.tsx`
- `src/components/signals/ManualSignalForm.tsx`
- `src/components/ideas/RefreshFeedButton.tsx`
- `src/lib/research/{serialize,keywords}.ts`
- `prisma/schema.prisma`, `prisma/migrations/`
- `docker-compose.yml`
- `src/app/layout.tsx`, `src/app/page.tsx`
- `src/app/api/health/route.ts`, `route.test.ts`
- `README.md`, `.env.example`

**Ещё нет:** scoring domain (F4), pipeline (F5), idea cards UI (F6)
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
| **F2-01 Research model** | **✅ DONE** | internal container |
| **F2-02 Research UI** | **✅ DONE** | secondary |
| **F2-03 Ideas feed shell** | **✅ DONE** | `2026-07-30` pivot |
| **F3-01 Signal model** | **✅ DONE** | `2026-07-30` |
| **F3-02 Source adapters** | **✅ DONE** | `2026-07-31` |
| F4-01 Score formulas | ⏳ TODO | следующий шаг |
| F4+ | ❌ | после F4-01 |

## Внешние гейты / блокеры

- F3-02 live: PH/Reddit нужены API keys в env (без них — graceful errors; HN работает без ключа).
- Git: `git@github.com:FilinCold/AnalyticSaaS.git`
  - `main` / `develop` включают F2 (PR #2/#3)
  - рабочая ветка: `TASK-3@signals` (F3-01/F3-02 **ещё не закоммичены**)
- Диск: следить за свободным местом — при ENOSPC чистить sandbox-cache / лишние `node_modules`.

## Текущий следующий шаг

**F4-01 Score formulas (unit):**  
`project_context/features/05-scoring-domain/01-score-formulas/STEP.md`

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
| F2-01 | Research model | **DONE** | 2026-07-30 |
| F2-02 | Research UI (secondary) | **DONE** | 2026-07-30 |
| F2-03 | Ideas feed shell | **DONE** | 2026-07-30 |
| F3-01 | Signal model | **DONE** | 2026-07-30 |
| F3-02 | Source adapters | **DONE** | 2026-07-31 |
| F4-01 | Score formulas | TODO | — |
| 01–09 | Реализация по features/ | IN PROGRESS | F3 DONE |

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
- `2026-07-30` — **F2-01:** Research model + zod + CRUD API; migrate `add_researches`; T1–T7; **F2-01 закрыт**.
- `2026-07-30` — **STATE sync:** ветка `TASK-2@feat_research`; next = F2-02; F2-01 uncommitted.
- `2026-07-30` — **F2-02:** Research list/create/detail UI; keywords helper; T1–T4 smoke; **F2-02 закрыт**.
- `2026-07-30` — Синхрон README фич: 01/02/03; step-TEMPLATE: обновлять README фичи.
- `2026-07-30` — **UX pivot:** лента идей (news-portal); SSOT VISION/MVP/Flows/API/DOMAIN/ROADMAP/DECISIONS.
- `2026-07-30` — **F2-03:** `/ideas` shell + API stub; login→ideas; **F2-03 закрыт**; next = F3-01.
- `2026-07-30` — STATE: добавлен owner verify checklist (A–E) для pivot + F2.
- `2026-07-30` — UI + user-facing API errors переведены на русский (`lang=ru`).
- `2026-07-30` — **F3-01:** Signal model + manual API/UI; migrate `add_signals`; maybeTrigger stub; T1–T5; **F3-01 закрыт**; next = F3-02.
- `2026-07-31` — **F3-02:** HN/PH/Reddit + mock; system feed; `/api/ideas/ingest` + research ingest; UI «Обновить ленту»; T1–T4; **F3-02 закрыт**; next = F4-01.
