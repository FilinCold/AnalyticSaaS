# DECISIONS — принятые архитектурные и продуктовые решения

> При конфликте приоритет у более нового требования / более новой записи.

## 2026-07-29 — Протокол и структура

- Код: `AnalyticProject/`. Kickoff-план: `project_context/`. SSOT требований: `docs/`.
- Требования частями = единое ТЗ; новое > старое; без кода до команды; неясности → `OPEN_QUESTIONS.md`.

## 2026-07-29 — Продукт (Части 1–5)

- **Назначение:** AI-поиск коммерчески проверяемых идей micro-SaaS; не product analytics.
- **One-job + шаблон + исключения платформ/CRM/ERP…; One Job ≥ 80.**
- **Создатель найденного продукта:** соло + AI coding agent; AI Buildability ≥ 75.
- **Срок:** ≤14 календарных дней полный цикл; поля карточки build; процедура сужения.
- **Продажи:** First Sale ≥ 70; достаточный спрос ≠ лайки/интерес без действия.
- **Итоговый фильтр recommended:** days≤14 ∧ AI≥75 ∧ OneJob≥80 ∧ FirstSale≥70.
- **Пользователь AnalyticSaaS:** совпадает с профилем создателя (Часть 3) — принято для MVP.

## 2026-07-29 — Синтез архитектуры (после «все основные требования переданы»)

- ~~**One Job платформы:** ниша → ранжированные карточки…~~ → **superseded 2026-07-30:** лента идей без обязательной ниши (`VISION.md`).
- **MVP = vertical slice** (`MVP_SCOPE.md`); non-goals зафиксированы (`NON_GOALS.md`).
- **Стек (предложение, можно сменить до кода):** Next.js App Router + TS + Prisma + PostgreSQL + Auth (Auth.js или Clerk) + Inngest или BullMQ + один LLM API.
- **Скоринг:** формулы равных весов + штрафы First Sale + Opportunity weights 0.30/0.25/0.30/0.15 (`AI_PIPELINE.md`).
- ~~Один авто-адаптер~~ → **три авто-адаптера в MVP** (HN, Product Hunt, Reddit); см. блок «2026-07-29 — Стек MVP».
- **Шаги UI основного flow ≠ «вспомогательные возможности»:** ≤3 auxiliary capabilities; шаги одного flow допустимы (разрешение кажущегося конфликта Частей 2 и 4).
- **Код не начат;** реализация по `ROADMAP.md` только после явной команды владельца.
- **Обновление идей (уточнение владельца):** три триггера pipeline — (1) автоматически при первом Research с сигналами, (2) кнопка «Обновить идеи», (3) cron раз в **3 календарных дня** на Research. Не путать с глобальным краулингом всех ниш (`NON_GOALS.md`).

## 2026-07-29 — Разрешение коллизий документации (аудит)

| Тема | Решение |
|---|---|
| Порог сигналов для **автозапуска pipeline** | ≥ **1** сигнал (manual и/или ingest). **≥3** — только для демо-сценария и приёмки F3/E2E. |
| «Vertical slice» vs полная приёмка MVP | **Ручной happy path** (Flow A, E2E F8-01) — без cron. **MVP acceptance checklist** — включает scheduled refresh (Flow A2). |
| Терминальный статус pipeline | Везде **`succeeded`** / `failed` (не `done`). UX-копия: «Готово» / «Ошибка». |
| Rate limit на pipeline | MVP: **блокировка дубля run** (queued/running) + не более **1 manual start за 5 мин** на Research. Полный per-user rate limit по всем Research — **post-MVP** (`ROADMAP` F5-06). |
| UI для `narrowed` | Отдельная вкладка **«Суженные»** в Ideas UI (F6-04); Flow C. |
| `go` / `kill` в карточке | `go` → поле **`continue_criteria`**; `kill` → **`stop_criteria`** (`DATABASE.md`). |
| `signals.source_type` | `manual` \| `hackernews` \| `producthunt` \| `reddit` \| `forum` \| … |
| `PipelineRun.trigger` | Обязательное поле: `initial` \| `manual` \| `scheduled` — в `DOMAIN_MODEL.md` и `DATABASE.md`. |
| LLM vs pure scoring | LLM генерирует **draft + score_breakdown** (0/50/100 по критериям). **Итоговые int-скоры** — только pure functions F4 из breakdown (`AI_PIPELINE.md`). |
| Failed pipeline UX | Flow D: статус `failed`, кнопка «Повторить анализ», текст ошибки без секретов. |

## 2026-07-29 — Стек MVP (закрытие OPEN_QUESTIONS, решение владельца)

| Тема | Решение |
|---|---|
| Auth | **Auth.js** (NextAuth v5) + **email/password** (Credentials). Solo-пользователь (владелец). Magic link — не в MVP. OAuth — не в MVP. |
| Job runner | **Inngest** (Vercel-native, cron встроен, без Redis). BullMQ — отклонён для MVP. |
| LLM | **OpenAI API** / модель **`gpt-4o-mini`** → **уточнено 2026-07-31:** gateway **OpenRouter** (см. ниже). Mock в тестах обязателен. |
| Hosting | **Vercel** (app) + **Neon** (managed PostgreSQL). |
| Source adapters | **Расширение MVP (владелец):** минимум **3** авто-источника — **Hacker News**, **Reddit**, **Product Hunt**; далее форумы (конкретика TBD). Интерфейс `SourceAdapter` + реализации по одной. Manual paste остаётся. |
| Порядок реализации адаптеров | 1) HN (Algolia, без ключа) → 2) Product Hunt → 3) Reddit (OAuth/app). Форумы — после трёх базовых. |
| `source_type` | `manual` \| `hackernews` \| `producthunt` \| `reddit` \| `forum` \| … |
| PDF/Markdown export | **Не нужен** (ни MVP, ни планируемый post-MVP по запросу владельца). |
| Post-MVP без изменений | Биллинг AnalyticSaaS; настройка интервала cron пользователем; orgs/SSO. |

**Легальность адаптеров:** только официальные/API-документированные endpoints; rate limits; без обхода ToS; ключи в server env.

## 2026-07-30 — Продуктовый pivot: лента идей (news-portal UX)

**Решение владельца:** целевой UX — как новостной портал, не «создай нишу → копай внутри».

| Было (до pivot) | Стало |
|---|---|
| Пользователь создаёт Research (ниша + keywords) | Пользователь **не** создаёт Research в основном flow |
| Идеи внутри своего Research | **Общая платформенная лента идей** (любые ниши) |
| One Job платформы: «задаёт нишу → карточки» | One Job: «заходит → актуальная лента micro-SaaS идей + аналитика по карточке» |
| Cron раз в 3 дня на каждый user Research | Cron **раз в 3–5 дней** (MVP: **3 календарных дня**) на **system feed** |
| Manual paste — основной путь сигналов | Manual paste — **вторичный** (demo/E2E/admin); основной путь — адаптеры |

**Технический мост (сохраняем F2-01):**
- Сущность `Research` остаётся как **внутренний контейнер pipeline/ingest** (system feed workspace).
- В MVP: один (или мало) **system Research** для глобального ingest; user-facing CRUD Research **не primary UX**.
- Идеи в ленте видны всем аутентифицированным пользователям (каталог платформы, не соцсеть UGC).
- Уже сделанные F2-01 API + F2-02 UI: API оставить; UI list/create — **demoted** (не home); новый шаг **F2-03** — shell ленты `/ideas` + stats.

**Не путать:** платформенная AI-лента идей ≠ маркетплейс/соцсеть чужих UGC-идей (`NON_GOALS.md`).

## 2026-07-31 — LLM gateway: OpenRouter (pay-as-you-go)

**Решение владельца:** для live LLM в MVP использовать **OpenRouter** как OpenAI-compatible gateway.

| Параметр | Значение |
|---|---|
| Gateway | **OpenRouter** (`https://openrouter.ai/api/v1`) |
| Модель по умолчанию | `openai/gpt-4o-mini` (slug OpenRouter) |
| Оплата | **Баланс / токены** (не подписка ChatGPT Plus) |
| Прямой OpenAI API | Опционально (`LLM_PROVIDER=openai`), если биллинг доступен |
| Dev / CI | `LLM_PROVIDER=mock` + `fixtures/llm/` |
| Env | `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`, опционально `LLM_BASE_URL` |

Причина: удобная оплата за фактический расход токенов (в т.ч. из РФ); без абонентки «пока не пользуюсь». Код: тот же `OpenAiProvider` + `baseURL`.

## 2026-07-31 — Impl freeze notes (F7–F8)

| Тема | Решение |
|---|---|
| Rescore days | **Без LLM:** heuristic `baseline = currentDays + 2×prevExcluded.length`; `newDays = max(1, baseline − 2×nextExcluded.length)` (`API.md` / `BACKGROUND_JOBS.md`) |
| E2E | **Playwright** Flow A на `LLM_PROVIDER=mock` + `ADAPTER_MODE=mock`; cron (Flow A2) — вне автоматизированного happy path |
| Ideas list API | Только `GET /api/ideas` (system feed). `GET /api/researches/:id/ideas` **не реализован** и не в MVP |
| Ideas index | Составной `(researchId, status, opportunityScore DESC)` без partial WHERE (Prisma MVP) |
| Auth session | Auth.js Credentials + **JWT**; PrismaAdapter не используется (конфликт с `password_hash`) |

## 2026-07-31 — MVP freeze (F8-02)

Реализация vertical slice **F0–F8** закрыта в коде. Документация синхронизирована.  
Статус продукта: **MVP ACCEPTED** (owner `2026-07-31`: «MVP ок»).  
Post-MVP — только через `NON_GOALS.md` / `OPEN_QUESTIONS.md` + новое решение владельца.

## 2026-07-31 — Owner acceptance

Владелец подтвердил vertical slice на mock (липовая идея в ленте — ожидаемо для `LLM_PROVIDER=mock`).  
Живые идеи (OpenRouter + live adapters) и production deploy — отдельные post-MVP треки.

## Разрешённые противоречия / уточнения

| Было | Стало |
|---|---|
| Kickoff «SaaS-аналитика» | Заменено назначением Части 1 |
| Фильтр 2→3→4 порога | Финально 4 порога + Opportunity для ранга |
| Пример 5 UI-шагов vs ≤3 auxiliary | Шаги flow ≠ auxiliary capabilities |
| Формулы скоров не заданы | Заданы в `AI_PIPELINE.md` как MVP-правила |
| ≥1 vs ≥3 сигналов; done vs succeeded; vertical slice vs cron | См. блок «2026-07-29 — Разрешение коллизий» выше |
