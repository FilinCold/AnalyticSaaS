# STATE — где мы остановились

**Проект/фича:** AnalyticSaaS — **MVP ACCEPTED** (owner `2026-07-31`)  
**Последнее обновление:** `2026-07-31` — owner: «MVP ок»; vertical slice F0–F8 закрыт; next = post-MVP (выбор владельца)

## Как проверить текущие правки (owner)

Dev должен быть на **:3010** (`cd AnalyticProject && npm run dev`). Health: `curl http://localhost:3010/api/health` → `{"ok":true}`.  
Для pipeline job: `npm run inngest:dev` + `LLM_PROVIDER=mock` (или openrouter + key).  
Quick start: root [`README.md`](../README.md).

### A. Автотесты

```bash
cd AnalyticProject
npm run lint && LLM_PROVIDER=mock npm test && npm run build
```

Ожидание: lint OK; **169** tests passed (1 skipped); build OK.  
Для analyze/pipeline: параллельно `npm run inngest:dev` (иначе enqueue → 502 с hint).
Для E2E: `LLM_PROVIDER=mock npm run test:e2e` (сам поднимает Next+Inngest, если ещё не запущены).
### B. Браузер — pivot + F2-03 + F6-01…04 (главное) · UI на русском

1. Открой http://localhost:3010/login → войди (или зарегистрируй нового).
2. После входа должен открыться **`/ideas`** (не `/researches`).
3. На странице: заголовок **Идеи**, статистика, вкладки (Рекомендованные / Суженные / Исключённые), empty или таблица recommended, кнопка **Обновить ленту**.
4. В шапке: **Идеи** primary, **Исследования** secondary, **Выйти**.
5. Анонимно открой http://localhost:3010/ideas → редирект на login с `callbackUrl=/ideas`.
6. Страницы **Вход** / **Регистрация** — тексты на русском.
7. Empty recommended + excluded>0 → ссылка «Посмотреть исключённые (N)».
8. Ссылка из таблицы → **`/ideas/[id]`**: One Job, скоры, Build (план по дням), Sales («Когда продолжать» / «Когда остановиться»), Provenance.
9. Вкладка **Исключённые** → таблица с reasons chips (RU); карточка excluded → banner «Исключена».
10. Вкладка **Суженные** → таблица: features chips, badge «Сужено системой», CTA «Открыть карточку»; карточка narrowed → banner.

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

### G. F4-01 Score formulas (unit)

```bash
cd AnalyticProject && npm test -- -t scoring
```

Ожидание: **34** passed. Pure domain, без UI/API.

### H. F4-02 Narrowing helper (unit)

```bash
cd AnalyticProject && npm test -- -t applyNarrowing
```

Ожидание: **6** passed. Pure domain, без UI/API.

### I. F5-01 Pipeline models (DB)

```bash
cd AnalyticProject
npx prisma migrate deploy && npx prisma validate
npm test -- -t pipeline
```

Ожидание: migrate OK; **3** passed (types + PipelineRun FK + Idea jsonb). Без UI/API.

### J. F5-02 LLM client (unit)

```bash
cd AnalyticProject
LLM_PROVIDER=mock npm test -- -t llm
```

Ожидание: **6** passed (T1–T2 + factory + openrouter resolve). Без live API keys. T3: `rg` в README — нет `@/lib/llm` в client components.

### L. F5-03 Pipeline wire-up (integration) · без UI

```bash
cd AnalyticProject
LLM_PROVIDER=mock npm test -- -t pipeline
npm run lint && npm test && npm run build
```

Ожидание: pipeline integration green; full suite **129** (1 skipped).

### M. F5-04 API analyze/status · research detail UI

```bash
cd AnalyticProject
npm test -- -t analyze
```

Ожидание: **10** passed (T1–T7 + extras + enqueue 502).

**Браузер (owner):**

1. Research detail с ≥1 сигналом → badge «Нет запусков» + кнопка **Обновить идеи**.
2. Клик → badge «В очереди»/«Анализ…» (нужен `inngest:dev` + mock LLM) → «Готово».
3. Повторный клик сразу → disabled / 409 (active или cooldown 5 мин).
4. Без сигналов → 422.
5. Failed run → ошибка + **Повторить анализ**.
6. Без `inngest:dev` → 502 «Очередь задач недоступна…» (не сырой 500).

### N. F5-05 Auto-initial

```bash
cd AnalyticProject
npm test -- -t maybeTriggerInitialPipeline
```

Ожидание: **5** passed.

**Браузер (owner / Flow A шаг 4):**

1. `/ideas` → **Обновить ленту** (mock: +сигналы) → баннер «Анализ запущен автоматически» (нужен `inngest:dev`).
2. Повторный ingest → баннер не дублирует initial (уже был run).
3. Research detail: первый manual signal → тот же баннер без клика **Обновить идеи**.

### O. F5-06 Scheduled refresh

```bash
cd AnalyticProject
npm test -- -t "runScheduleRefresh|schedule-refresh"
```

Ожидание: **8** passed (T1–T4 + Flow A2 note + dev route).

**Dev trigger:**

```bash
curl -X POST http://localhost:3010/api/dev/cron/schedule-refresh
# → {"ok":true,"mode":"direct","enqueued":[…],"skipped":[…]}
```

**Браузер (owner / Flow A2):**

1. Research detail: «Последнее обновление: …» + чекбокс «Автообновление раз в 3 дня».
2. Toggle → PATCH `autoRefreshEnabled` (повторный cron пропускает disabled).
3. Seed `lastPipelineFinishedAt` ≥4 дней назад → cron enqueue `trigger=scheduled` (нужен `inngest:dev` для полного pipeline).

### P. F6-01 Recommended list

```bash
cd AnalyticProject
npm test -- -t "GET /api/ideas|passesRecommendedGuard"
```

Ожидание: API + guard green.

**Браузер (owner / Flow A шаг 6):**

1. После succeeded pipeline на system feed → `/ideas` таблица recommended (Opportunity DESC).
2. Empty → «Нет рекомендованных идей»; если excluded>0 — ссылка на вкладку.
3. Вкладки: Исключённые — F6-03; Суженные — F6-04.

### Q. F6-02 Idea card

```bash
cd AnalyticProject
npm test -- -t idea-card
```

Ожидание: **6** passed (API T1–T2 + 401/404 + UI T3–T4).

**Браузер (owner / Flow A шаг 7):**

1. Из recommended таблицы открыть `/ideas/[id]`.
2. Видны: проблема + статус, One Job (шаблон + 6 attrs), скоры с полосками, Build (план по дням), Sales («Когда продолжать» / «Когда остановиться»), Provenance.
3. Чужой/missing id → страница «Не найдено».

### R. F6-03 Excluded list

```bash
cd AnalyticProject
npm test -- -t "exclusion reason|excluded-list|T1 excluded|T2 excluded"
```

Ожидание: labels + API + UI green.

**Браузер (owner / Flow B):**

1. `/ideas?tab=excluded` — таблица: problem, reasons chips (RU), scores.
2. Клик → карточка с banner «Исключена»; Provenance — русские причины.
3. Recommended не видны во вкладке excluded.

### S. F6-04 Narrowed list

```bash
cd AnalyticProject
npm test -- -t "narrowed|T1 narrowed|T2 narrowed"
```

Ожидание: API + UI green.

**Браузер (owner / Flow C шаг 1):**

1. `/ideas?tab=narrowed` — таблица: problem, badge «Сужено системой», features chips, CTA «Открыть карточку».
2. Клик → карточка с banner «Сужено системой»; Build — «Исключено под дедлайн».
3. Recommended не видны во вкладке narrowed.

### T. F7-01 Edit narrowing + rescore

```bash
cd AnalyticProject
npm test -- -t rescore
```

Ожидание: unit + API + UI green.

**Браузер (owner / Flow C шаг 2):**

1. Открыть narrowed (или recommended) карточку → секция **Сужение**.
2. Добавить/убрать фичи chips → **Пересчитать скоры**.
3. Toast «Статус: recommended» или «остаётся narrowed»; скоры/статус обновляются.
4. Во время активного pipeline analyze → rescore → 409.

### U. F8-01 E2E happy path

```bash
cd AnalyticProject
npx playwright install chromium   # once
LLM_PROVIDER=mock ADAPTER_MODE=mock npm run test:e2e
npm test -- -t "LLM client bundle"
```

Ожидание: Playwright Flow A green; T2 bundle guard green. Нужны Postgres + (авто) Next+:3010 + Inngest:8288.
### K. Docs sync / freeze (F8-02)

Manual review: `docs/API.md`, `DATABASE.md`, `LLM_CONTRACT.md`, `IDEA_CARD_SPEC.md`, `ACCEPTANCE_CRITERIA.md`, `OPEN_QUESTIONS.md`.  
Root `README.md` + Known limitations. MVP blockers в OPEN_QUESTIONS — закрыты.
---

## Как продолжить в новом чате

**Для продолжения (post-MVP):**

> Прочитай `docs/OPEN_QUESTIONS.md` § после MVP. Выбери один трек (live ideas / deploy / UX / product). Согласуй план — потом код.

**Порядок чтения агента:**  
`04_STATE.md` → `OPEN_QUESTIONS.md` → `DECISIONS.md` / `NON_GOALS.md`.

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
22. **F4-01** — Pure scoring: OneJob/AI/FirstSale/TimeFit/Opportunity + filter; 34 unit tests; T1–T6 OK.
23. **F4-02** — `applyNarrowing` (−2/feature, −2 manual once); 6 unit tests; T1–T4 OK.
24. **F5-01** — Prisma Idea / PainCluster / PipelineRun; migrate `add_pipeline_domain`; `domain/types.ts`; T1–T3 OK.
25. **F5-02** — LLM client: Mock + OpenAI-compatible; OpenRouter gateway (`LLM_PROVIDER=openrouter`); Zod schemas; fixtures; T1–T2 + factory/openrouter tests; T3 в README.
26. **F5-03** — Pipeline wire-up: `executePipelineRun` + Inngest `pipeline/run`; steps ingest→finish; mock fixtures; T1–T7; **106** tests (до F5-04).
27. **F5-04** — POST analyze + GET pipeline-runs; UI badge/кнопка/poll; T1–T7; **115** tests.
28. **F5-05** — `maybeTriggerInitialPipeline` real; banner `/ideas` + research; T1–T3; **120** tests.
29. **F5-06** — scheduled refresh cron 03:00 UTC; `runScheduleRefresh`; UI date + toggle; T1–T4; затем hotfix Prisma/analyze → **129** tests.
30. **F6-01** — recommended list: `GET /api/ideas` real + guard; `/ideas` tabs/table/empty; T1–T3; **138** tests.
31. **F6-02** — idea card: `GET /api/ideas/[id]` + `/ideas/[id]` sections; T1–T4; **144** tests.
32. **F6-03** — excluded list: labels RU + tab table + card banner; T1–T2; **152** tests.
33. **F6-04** — narrowed list: features in list + tab table + card banner; T1–T2; **157** tests.
34. **F7-01** — edit narrowing + rescore: PATCH + heuristic days; sync POST rescore; Inngest job; UI form; T1–T4; **167** tests.
35. **F8-01** — Playwright Flow A (mock LLM, system feed ingest → pipeline → idea card); T1–T3; **169** unit + e2e green.
36. **F8-02** — Docs sync + freeze MVP; ACCEPTANCE checked; OPEN_QUESTIONS blockers closed; root README + Known limitations.

### ⏳ Следующая задача

**Post-MVP — выбор владельца** (один трек за раз):  
1) Live ideas (OpenRouter + `ADAPTER_MODE=live`) · 2) Deploy Vercel+Neon · 3) UX polish (авто-refresh таблицы после анализа) · 4) фильтры/закладки/форумы — см. `OPEN_QUESTIONS`.

### ❌ Не начато

- Production deploy (Vercel + Neon).
- Live LLM/adapters в повседневном использовании.
- Post-MVP product features (`OPEN_QUESTIONS`).
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
| maybeTriggerInitialPipeline | ✅ DONE | real F5-05 |
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

## Прогресс F4-01 (Score formulas)

| Подзадача | Статус | Проверка |
|---|---|---|
| types + module tree | ✅ DONE | `src/domain/scoring/` |
| OneJob / AI / FirstSale / TimeFit / Opportunity | ✅ DONE | SSOT `AI_PIPELINE.md` |
| applyRecommendedFilter | ✅ DONE | recommended/narrowed/excluded + reasons |
| hard gate empty template | ✅ DONE | cap OneJob ≤59 |
| table tests T1–T6 + extras | ✅ DONE | 34 cases |

**Тест-кейсы F4-01:** T1–T6 ✅

**Проверено** `2026-07-31`: `npm test -- -t scoring` 34 passed; full suite 83 passed (1 skipped); lint/build OK.

## Прогресс F4-02 (Narrowing helper)

| Подзадача | Статус | Проверка |
|---|---|---|
| `applyNarrowing` API | ✅ DONE | `src/domain/scoring/narrowing.ts` |
| Heuristic −2/feature + manual −2 | ✅ DONE | constants documented |
| No duplicate excludes | ✅ DONE | T4 |
| Export from barrel | ✅ DONE | `scoring/index.ts` |
| tests T1–T4 + extras | ✅ DONE | 6 cases |

**Тест-кейсы F4-02:** T1–T4 ✅

**Проверено** `2026-07-31` (agent): `npm test -- -t applyNarrowing` 6 passed; full suite 89; lint/build OK.  
**Owner verify** `2026-07-31`: `npm run lint && npm test && npm run build` — 89 passed (1 skipped); lint OK; build OK. **F4 закрыт.**

## Прогресс F5-01 (Pipeline models)

| Подзадача | Статус | Проверка |
|---|---|---|
| PainCluster / Idea / PipelineRun | ✅ DONE | `prisma/schema.prisma` |
| Indexes | ✅ DONE | ideas composite + pipeline_runs; partial note in SQL |
| migrate `add_pipeline_domain` | ✅ DONE | `20260731120000_add_pipeline_domain` |
| `src/domain/types.ts` | ✅ DONE | status/trigger unions |
| tests T1–T3 | ✅ DONE | `pipeline-models.test.ts` |

**Тест-кейсы F5-01:** T1–T3 ✅

**Проверено** `2026-07-31` (agent): migrate deploy; `npm test -- -t pipeline` 3 passed; full suite **92** passed (1 skipped); lint/build OK.

## Прогресс F5-02 (LLM client)

| Подзадача | Статус | Проверка |
|---|---|---|
| Zod schemas (6) | ✅ DONE | `src/lib/llm/schemas.ts` |
| `LlmProvider` + Mock | ✅ DONE | fixtures `fixtures/llm/` |
| `OpenAiProvider` + `baseURL` | ✅ DONE | OpenAI-compatible / OpenRouter |
| Factory `createLlmProvider` | ✅ DONE | `mock\|openai\|openrouter` |
| OpenRouter defaults | ✅ DONE | `OPENROUTER_BASE_URL` + `openai/gpt-4o-mini` |
| `.env.example` + README how-to | ✅ DONE | pay-as-you-go инструкция |
| DECISIONS § 2026-07-31 | ✅ DONE | gateway = OpenRouter |
| tests T1–T2 + factory/openrouter | ✅ DONE | `llm.test.ts` (6) |
| T3 client-bundle note | ✅ DONE | AnalyticProject README |

**Тест-кейсы F5-02:** T1–T2 ✅; T3 ✅ documented

**Проверено** `2026-07-31` (agent): `npm test -- -t llm` 6 passed; full suite **98** passed (1 skipped); lint OK.  
**Owner note:** ChatGPT Plus (~$20) ≠ API; live только через OpenRouter/API ключ; до F5-03 live ключ не обязателен (`mock`).

## Прогресс F5-03 (Pipeline wire-up)

| Подзадача | Статус | Проверка |
|---|---|---|
| 01 orchestrator shell | ✅ DONE | `executePipelineRun` + Inngest `pipeline/run` |
| 02 ingest + normalize | ✅ DONE | 0 signals → failed; normalizedText |
| 03 extract + cluster | ✅ DONE | mock fixtures + PainCluster rows |
| 04 draft ideas | ✅ DONE | candidate + sales-block |
| 05 estimate + narrow | ✅ DONE | F4-02 when days>14 |
| 06 score + filter + finish | ✅ DONE | research ready; run succeeded |
| tests T1–T7 | ✅ DONE | `pipeline.run.test` + llm-retry |

**Тест-кейсы F5-03:** T1–T2 ✅ integration; T3 ✅ `withLlmRetry`; T4–T7 ✅ in T1

**Проверено** `2026-07-31` (agent): `LLM_PROVIDER=mock npm test` **106** passed (1 skipped); lint OK; build OK.  
**Owner verify** `2026-07-31`: UI без видимых изменений (ожидаемо — backend-only); **F5-03 закрыт**.

## Прогресс F5-04 (API analyze/status)

| Подзадача | Статус | Проверка |
|---|---|---|
| POST `/api/researches/[id]/analyze` | ✅ DONE | queued + enqueue; guards 409/422/404 |
| GET latest + GET [runId] | ✅ DONE | serialize + ownership |
| UI badge + «Обновить идеи» + poll 3s | ✅ DONE | research detail |
| Flow D retry label | ✅ DONE | failed → «Повторить анализ» |
| tests T1–T7 | ✅ DONE | `analyze.api.test.ts` (9) |

**Тест-кейсы F5-04:** T1–T7 ✅

**Проверено** `2026-07-31` (agent): `npm test -- -t analyze` 9 passed; full suite **115** passed (1 skipped); lint OK; build OK (analyze + pipeline-runs routes).  
**Hotfix** `2026-07-31`: enqueue fail → 502 + hint `inngest:dev`; run → `failed`; analyze tests **10**.

## Прогресс F5-05 (Auto-initial)

| Подзадача | Статус | Проверка |
|---|---|---|
| `maybeTriggerInitialPipeline` | ✅ DONE | ≥1 signal, no prior initial, no active → enqueue |
| Call sites signal + ingest | ✅ DONE | уже были; stub → real |
| UI banner research detail | ✅ DONE | AnalyzeIdeasPanel |
| UI banner `/ideas` | ✅ DONE | AutoInitialBanner + refresh |
| tests T1–T3 + extras | ✅ DONE | `maybe-trigger-initial.test.ts` (5) |

**Тест-кейсы F5-05:** T1–T3 ✅; T4 ⏳ owner Flow A

**Проверено** `2026-07-31` (agent): `npm test -- -t maybeTriggerInitialPipeline` 5 passed; full suite **120** passed (1 skipped); lint OK; build OK.

## Прогресс F5-06 (Scheduled refresh)

| Подзадача | Статус | Проверка |
|---|---|---|
| `runScheduleRefresh` query + enqueue | ✅ DONE | 3d cutoff; null lastFinished → skip |
| Inngest cron `0 3 * * *` + event | ✅ DONE | `scheduleRefreshJob` |
| Dev `POST /api/dev/cron/schedule-refresh` | ✅ DONE | NODE_ENV=development |
| UI date + AutoRefreshToggle | ✅ DONE | research detail |
| tests T1–T4 + Flow A2 note + route | ✅ DONE | 8 cases |

**Тест-кейсы F5-06:** T1–T4 ✅; T5 ⏳ owner Flow A2

**Проверено** `2026-07-31` (agent): `npm test -- -t "runScheduleRefresh|schedule-refresh"` 8 passed; full suite **128** passed (1 skipped); lint OK; build OK.  
**Hotfix** `2026-07-31`: Prisma HMR refresh для `pipelineRun`/`idea`/… (stale client → `/ideas` 500); full suite **129**.

## Прогресс F6-01 (Recommended list)

| Подзадача | Статус | Проверка |
|---|---|---|
| `listIdeasFeed` + serialize + guard | ✅ DONE | system feed; opportunity DESC; thresholds |
| `GET /api/ideas?status=` | ✅ DONE | default recommended; 400 invalid |
| UI tabs + table + empty | ✅ DONE | `/ideas`; placeholders F6-03/04 |
| tests T1–T3 + guard | ✅ DONE | ideas.api + recommended-guard |

**Тест-кейсы F6-01:** T1–T3 ✅; T4 ✅ owner Flow A step 6 (лента + pipeline → recommended card)

**Проверено** `2026-07-31` (agent): `npm test -- -t "GET /api/ideas|passesRecommendedGuard"`; full suite **138** passed (1 skipped); lint OK; build OK.  
**Owner verify** `2026-07-31`: `/ideas` shell + после analyze — recommended идея в ленте.

## Прогресс F6-02 (Idea card)

| Подзадача | Статус | Проверка |
|---|---|---|
| a-api-detail | ✅ DONE | `GET /api/ideas/[ideaId]` + contract |
| b-onejob-scores | ✅ DONE | page + OneJob + Scores |
| c-build-sales | ✅ DONE | Build + Sales + Provenance |
| tests T1–T4 | ✅ DONE | idea-card.api + ui |

**Тест-кейсы F6-02:** T1–T4 ✅; T5 ✅ owner Flow A step 7 (карточка One Job / Скоры / Build)

**Проверено** `2026-07-31` (agent): `npm test -- -t idea-card` 6 passed; full suite **144** passed (1 skipped); lint OK; build OK (`/ideas/[ideaId]`, `/api/ideas/[ideaId]`).  
**Owner verify** `2026-07-31`: открыл recommended карточку — статус «Рекомендована», скоры, Build.

## Прогресс F6-03 (Excluded list)

| Подзадача | Статус | Проверка |
|---|---|---|
| reason labels RU | ✅ DONE | `exclusion-reasons.ts` |
| `GET ?status=excluded` | ✅ DONE | list-feed + API tests |
| UI tab table + chips | ✅ DONE | `ExcludedIdeasTable` |
| card banner «Исключена» | ✅ DONE | `IdeaCardHeader` |
| Provenance RU labels | ✅ DONE | `ProvenanceSection` |
| tests T1–T2 | ✅ DONE | labels + API + UI |

**Тест-кейсы F6-03:** T1–T2 ✅; T3 ⏳ owner Flow B

**Проверено** `2026-07-31` (agent): `npm test -- -t "exclusion reason|excluded-list|T1 excluded|T2 excluded"`; full suite **152** passed (1 skipped); lint OK; build OK.

## Прогресс F6-04 (Narrowed list)

| Подзадача | Статус | Проверка |
|---|---|---|
| list serialize features | ✅ DONE | `featuresExcludedToFitDeadline` в list item |
| `GET ?status=narrowed` | ✅ DONE | list-feed + API tests |
| UI tab table + chips | ✅ DONE | `NarrowedIdeasTable` |
| card banner «Сужено системой» | ✅ DONE | `IdeaCardHeader` |
| tests T1–T2 | ✅ DONE | API + UI |

**Тест-кейсы F6-04:** T1–T2 ✅; T3 ⏳ owner Flow C

**Проверено** `2026-07-31` (agent): `npm test -- -t "narrowed|T1 narrowed|T2 narrowed"`; full suite **157** passed (1 skipped); lint OK; build OK.

## Прогресс F7-01 (Edit narrowing + rescore)

| Подзадача | Статус | Проверка |
|---|---|---|
| PATCH `/api/ideas/[id]/narrowing` | ✅ DONE | zod + heuristic days |
| `executeIdeaRescore` + Inngest job | ✅ DONE | TimeFit/Opportunity/filter |
| POST `/api/ideas/[id]/rescore` | ✅ DONE | sync 200; race 409 |
| UI NarrowingEditForm | ✅ DONE | chips + «Пересчитать скоры» |
| tests T1–T4 | ✅ DONE | rescore unit + API + UI |

**Тест-кейсы F7-01:** T1–T4 ✅; T5 ⏳ owner Flow C

**Проверено** `2026-07-31` (agent): `npm test -- -t rescore`; full suite **167** passed (1 skipped); lint OK; build OK.

## Прогресс F8-01 (E2E happy path)

| Подзадача | Статус | Проверка |
|---|---|---|
| Playwright config + `test:e2e` | ✅ DONE | `playwright.config.ts`; webServers Next+Inngest |
| reset system feed helper | ✅ DONE | `e2e/helpers/reset-system-feed.ts` |
| `e2e/flow-a.spec.ts` Flow A | ✅ DONE | register → ingest → pipeline → card |
| Mock LLM / ADAPTER_MODE=mock | ✅ DONE | fixtures draft-ideas-recommended |
| T2 client bundle guard | ✅ DONE | `src/lib/llm/llm-bundle.test.ts` |
| README e2e + CI note | ✅ DONE | AnalyticProject README |

**Тест-кейсы F8-01:** T1–T3 ✅

**Проверено** `2026-07-31` (agent): `LLM_PROVIDER=mock npm run test:e2e` green; full suite **169** passed (1 skipped); lint OK; build OK.

## Прогресс F8-02 (Docs sync + freeze MVP)

| Подзадача | Статус | Проверка |
|---|---|---|
| Sync API / DATABASE / LLM / BACKGROUND / ARCH | ✅ DONE | пути, source_type, Inngest-only, ideas API |
| OPEN_QUESTIONS + DECISIONS freeze | ✅ DONE | blockers closed; § F7–F8 + MVP freeze |
| ACCEPTANCE_CRITERIA checkboxes | ✅ DONE | все MVP boxes `[x]`; deferrals нет |
| Root README + Known limitations | ✅ DONE | quick start full stack |
| STATE / features / navigator | ✅ DONE | MVP DONE pending owner |

**Тест-кейсы F8-02:** T1–T2 ✅ (manual doc review)

**Проверено** `2026-07-31` (agent): docs review; contradictions API↔code сняты; **F8-02 закрыт**; **MVP DONE pending owner**.

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
| OpenAI | 4.104.x (F5-02) |
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
- `src/lib/pipeline/maybe-trigger-initial.ts`, `maybe-trigger-initial.test.ts`
- `src/lib/pipeline/schedule-refresh.ts`, `schedule-refresh.test.ts`
- `src/jobs/schedule-refresh.ts`
- `src/app/api/dev/cron/schedule-refresh/route.ts`, `route.test.ts`
- `src/components/research/AutoRefreshToggle.tsx`
- `src/adapters/` (types, mock, hackernews, producthunt, reddit, index)
- `src/domain/signals/ingest.ts`
- `src/domain/scoring/` (types, oneJob, aiBuildability, firstSale, timeFit, opportunity, filter, narrowing, index, scoring.test, narrowing.test)
- `src/domain/types.ts`, `src/domain/pipeline-models.test.ts`
- `src/lib/llm/` (types, schemas, mock, openai, create, index, prompts, llm.test)
- `fixtures/llm/*.json`
- `src/domain/pipeline/` (normalize-text, errors, llm-retry + tests)
- `src/jobs/pipeline.run.ts`, `pipeline.run.test.ts`, `src/jobs/pipeline/steps/*`
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
- `src/app/api/researches/[researchId]/analyze/route.ts`, `analyze.api.test.ts`
- `src/app/api/researches/[researchId]/pipeline-runs/latest/route.ts`
- `src/app/api/researches/[researchId]/pipeline-runs/[runId]/route.ts`
- `src/lib/pipeline/serialize.ts`, `constants.ts`
- `src/lib/validation/analyze.ts`
- `src/components/pipeline/{PipelineStatusBadge,AnalyzeIdeasPanel,AutoInitialBanner}.tsx`
- `src/lib/idea/{serialize,recommended-guard,list-feed,get-detail,exclusion-reasons,access,rescore}.ts` + tests
- `src/app/api/ideas/route.ts`, `ideas.api.test.ts`
- `src/app/api/ideas/[ideaId]/route.ts`, `idea-card.api.test.ts`
- `src/app/api/ideas/[ideaId]/narrowing/route.ts`
- `src/app/api/ideas/[ideaId]/rescore/route.ts`, `rescore.api.test.ts`
- `src/app/api/ideas/ingest/route.ts`
- `src/jobs/idea.rescore.ts`
- `src/lib/validation/narrowing.ts`
- `src/app/(auth)/{login,register}/page.tsx`
- `src/app/(app)/layout.tsx`, `src/app/(app)/ideas/page.tsx`
- `src/app/(app)/ideas/[ideaId]/page.tsx`, `not-found.tsx`
- `src/app/(app)/researches/page.tsx`
- `src/app/(app)/researches/new/page.tsx`
- `src/app/(app)/researches/[researchId]/page.tsx`, `not-found.tsx`
- `src/components/{app-header,logout-button}.tsx`
- `src/components/research/ResearchForm.tsx`
- `src/components/signals/ManualSignalForm.tsx`
- `src/components/ideas/{RefreshFeedButton,IdeasFeedTabs,RecommendedIdeasTable,ExcludedIdeasTable,NarrowedIdeasTable,IdeaCardHeader,OneJobSection,ScoresSection,BuildSection,SalesSection,ProvenanceSection,NarrowingEditForm}.tsx`
- `src/components/ideas/idea-card.ui.test.tsx`, `excluded-list.ui.test.tsx`, `narrowed-list.ui.test.tsx`, `narrowing-edit.ui.test.tsx`
- `src/lib/llm/llm-bundle.test.ts`
- `e2e/flow-a.spec.ts`, `e2e/helpers/reset-system-feed.ts`, `playwright.config.ts`
- `src/lib/research/{serialize,keywords}.ts`
- `prisma/schema.prisma`, `prisma/migrations/`
- `docker-compose.yml`
- `src/app/layout.tsx`, `src/app/page.tsx`
- `src/app/api/health/route.ts`, `route.test.ts`
- `README.md`, `.env.example`

**Ещё нет:** production deploy; live OpenRouter в проде; post-MVP

## Фазы проекта

| Фаза | Статус | Что дальше |
|---|---|---|
| Сбор требований (Части 1–5) | ✅ DONE | — |
| Архитектура + roadmap | ✅ DONE | — |
| Закрытие коллизий доков | ✅ DONE | `DECISIONS.md` |
| Разбивка features (каркас 9×24) | ✅ DONE | `project_context/features/` |
| **Детализация STEP.md (R4)** | **✅ DONE** | `2026-07-29` |
| Ревью владельцем | ✅ DONE | «ок, к реализации» `2026-07-29` |
| **F0–F8 реализация** | **✅ DONE** | `2026-07-31` |
| **F8-02 docs-sync + freeze** | **✅ DONE** | `2026-07-31` |
| **MVP** | **✅ ACCEPTED** | owner `2026-07-31` «MVP ок» |
| Post-MVP | ⏳ выбор | `OPEN_QUESTIONS` |

## Внешние гейты / блокеры

- F3-02 live: PH/Reddit нужены API keys в env (без них — graceful errors; HN работает без ключа).
- **LLM live (когда понадобится):** `LLM_PROVIDER=openrouter` + `LLM_API_KEY` (баланс/токены). ChatGPT Plus **не** даёт API. Pipeline F5-03 работает на `mock`. Прямой `openai` — опционально.
- Git: `git@github.com:FilinCold/AnalyticSaaS.git`
  - `main` / `develop` включают F2 (PR #2/#3)
  - реализация F3–F8 (+ docs freeze) — см. working tree / ветки; commit по запросу owner
  - F4 был на `TASK-4@scoring_domain` (статус коммита F4 — отдельно)
- Диск: следить за свободным местом — при ENOSPC чистить sandbox-cache / лишние `node_modules`.

## Текущий следующий шаг

**Post-MVP:** владелец выбирает трек (live ideas / deploy / UX / product).  
MVP vertical slice **ACCEPTED** `2026-07-31`.

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
| F4-01 | Score formulas | **DONE** | 2026-07-31 |
| F4-02 | Narrowing helper | **DONE** | 2026-07-31 |
| F5-01 | Pipeline models | **DONE** | 2026-07-31 |
| F5-02 | LLM client | **DONE** | 2026-07-31 |
| F5-03 | Pipeline wire-up | **DONE** | 2026-07-31 |
| F5-04 | API analyze/status | **DONE** | 2026-07-31 |
| F5-05 | Auto-initial | **DONE** | 2026-07-31 |
| F5-06 | Scheduled refresh | **DONE** | 2026-07-31 |
| F6-01 | Recommended list | **DONE** | 2026-07-31 |
| F6-02 | Idea card | **DONE** | 2026-07-31 |
| F6-03 | Excluded list | **DONE** | 2026-07-31 |
| F6-04 | Narrowed list | **DONE** | 2026-07-31 |
| F7-01 | Edit narrowing + rescore | **DONE** | 2026-07-31 |
| F8-01 | E2E happy path | **DONE** | 2026-07-31 |
| F8-02 | Docs sync + freeze MVP | **DONE** | 2026-07-31 |
| 01–09 | Реализация по features/ | **DONE** MVP ACCEPTED | 2026-07-31 |

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
- `2026-07-31` — **F4-01:** pure scoring domain (`OneJob`/`AI`/`FirstSale`/`TimeFit`/`Opportunity` + filter); 34 unit tests; **F4-01 закрыт**; next = F4-02.
- `2026-07-31` — **F4-02:** `applyNarrowing` (−2/feature, −2 manual once); 6 unit tests; **F4-02 закрыт**; next = F5-01.
- `2026-07-31` — **F4 owner-verify:** lint + 89 tests + build OK; F4 staged на `TASK-4@scoring_domain`; next = F5-01.
- `2026-07-31` — **F5-01:** Idea/PainCluster/PipelineRun + migrate `add_pipeline_domain` + `domain/types.ts`; T1–T3; **92** tests; **F5-01 закрыт**; next = F5-02.
- `2026-07-31` — **STATE sync:** owner checklist § I (F5-01); next = F5-02 + OPEN_QUESTIONS LLM; ветка `TASK-5@pipeline_jobs` uncommitted.
- `2026-07-31` — **F5-02:** `src/lib/llm` Mock+OpenAI, Zod schemas, fixtures; **97** tests; **F5-02 закрыт**; next = F5-03.
- `2026-07-31` — **LLM gateway:** OpenRouter pay-as-you-go (`LLM_PROVIDER=openrouter`); DECISIONS/ARCHITECTURE/README; **98** tests.
- `2026-07-31` — **STATE sync:** owner подтвердил — Plus ≠ API; live = OpenRouter/API; next = F5-03 (mock до live).
- `2026-07-31` — **F5-03:** `pipeline.run` wire-up (ingest→finish) + mock fixtures + T1–T7; **106** tests; **F5-03 закрыт**; next = F5-04.
- `2026-07-31` — **STATE sync (owner):** UI без изменений — норма для F5-03; visible effect только после F5-04/F6; next = F5-04.
- `2026-07-31` — **F5-04:** POST analyze + GET pipeline-runs + UI badge/кнопка/poll; T1–T7; **115** tests; **F5-04 закрыт**; next = F5-05.
- `2026-07-31` — **F5-05:** `maybeTriggerInitialPipeline` + banner `/ideas`/detail; T1–T3; **120** tests; **F5-05 закрыт**; next = F5-06.
- `2026-07-31` — **F5-06:** cron `0 3 * * *` + `runScheduleRefresh` + UI date/toggle + dev endpoint; T1–T4; **128** tests; **F5 закрыт**; next = F6-01.
- `2026-07-31` — **Hotfix:** Prisma singleton refresh delegates (`pipelineRun`…); analyze enqueue fail → 502 + hint; **129** tests.
- `2026-07-31` — **F6-01:** `GET /api/ideas` real + recommended guard; `/ideas` tabs/table/empty; T1–T3; **138** tests; **F6-01 закрыт**; next = F6-02.
- `2026-07-31` — **F6-02:** `GET /api/ideas/[id]` + card UI (One Job/Scores/Build/Sales); T1–T4; **144** tests; **F6-02 закрыт**; next = F6-03.
- `2026-07-31` — **F6-03:** excluded tab + RU reason labels + card banner; T1–T2; **152** tests; **F6-03 закрыт**; next = F6-04.
- `2026-07-31` — **F6-04:** narrowed tab + features chips + card banner; T1–T2; **157** tests; **F6 закрыт**; next = F7-01.
- `2026-07-31` — **Owner verify F6:** Flow A шаг 6–7 (recommended list + idea card) OK; note: Research = diagnostic; Ideas = primary UX. F6-03/04 tabs (excluded/narrowed) — owner ещё не подтвердил отдельно. Stale queued run пофиксен вручную (Inngest memory).
- `2026-07-31` — **F7-01:** PATCH narrowing + heuristic days; sync POST rescore; Inngest `idea-rescore`; UI NarrowingEditForm; T1–T4; **167** tests; **F7 закрыт**; next = F8-01.
- `2026-07-31` — **F8-01:** Playwright Flow A (mock LLM, system feed); T1–T3; **169** unit + e2e green; **F8-01 закрыт**; next = F8-02.
- `2026-07-31` — **F8-02:** docs sync (API/DB/LLM/jobs/ARCH) + ACCEPTANCE `[x]` + OPEN_QUESTIONS freeze + root README; **F8-02 закрыт**; **MVP DONE pending owner**.
- `2026-07-31` — **Owner:** «MVP ок» (mock idea accepted as vertical slice). **MVP ACCEPTED**. Next = post-MVP track choice.
