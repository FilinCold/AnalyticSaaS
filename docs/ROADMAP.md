# ROADMAP — фичи, шаги, порядок

> Разработка AnalyticSaaS. Код не начинать без отдельной команды владельца после ревью этих доков.  
> Стек-предложение: Next.js + TS + Prisma + PostgreSQL + Auth + Jobs + LLM (`ARCHITECTURE.md`).  
> **Пошаговые карточки реализации:** `project_context/features/` (нумерованные папки).

## Порядок реализации

```
F0 Bootstrap → F1 Auth → F2 Research (internal) + Feed shell
    → F3 Signals (adapters → system feed)
    → F4 Scoring domain (pure) → F5 Pipeline jobs
    → F6 Ideas UI (полная лента/карточка) → F7 Rescore/narrow → F8 Vertical-slice QA
```

Критический путь: F0→F1→F2→F3→F4→F5→F6. F7 после F6. F8 в конце.  
**Primary UX:** Ideas feed (F2-03 shell → F6). Research create — не на критическом UX-пути.

---

## F0 — Bootstrap проекта

### F0-01 — Каркас приложения
- **Цель:** пустой Next.js+TS проект в `AnalyticProject/` с lint/test runner.
- **Зависимости:** нет.
- **БД:** нет.
- **Backend:** scaffold only.
- **UI:** placeholder home.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** `npm test` / smoke script зелёный.
- **Приёмка:** приложение стартует локально; README с командами.
- **Риски:** лишний boilerplate.
- **Не входит:** auth, DB, UI продукта.

### F0-02 — Prisma + Postgres
- **Цель:** подключить Prisma, пустая миграция baseline.
- **Зависимости:** F0-01.
- **БД:** init schema.
- **Backend:** prisma client.
- **UI:** нет.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** `prisma migrate` на локальной БД.
- **Приёмка:** migrate deploy успешен.
- **Риски:** неправильный DATABASE_URL.
- **Не входит:** модели домена.

### F0-03 — Job runner skeleton
- **Цель:** подключён выбранный runner (Inngest/BullMQ), hello-job.
- **Зависимости:** F0-01.
- **БД:** нет (или queue tables если нужно).
- **Backend:** enqueue/process hello.
- **UI:** нет.
- **AI:** нет.
- **Фон:** hello job.
- **Тесты:** unit/integration «job executed».
- **Приёмка:** job отрабатывает локально.
- **Риски:** Redis/Inngest setup friction.
- **Не входит:** pipeline шаги.

---

## F1 — Auth

### F1-01 — Регистрация/вход
- **Цель:** пользователь может создать аккаунт и войти.
- **Зависимости:** F0-02.
- **БД:** `users` (+ auth tables).
- **Backend:** auth routes/session.
- **UI:** login/register pages.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** register → session → protected route 401 без сессии.
- **Приёмка:** Flow вход работает в браузере.
- **Риски:** выбор Clerk vs Auth.js.
- **Не входит:** OAuth providers сверх минимума, orgs.

### F1-02 — Защита API
- **Цель:** защищённые API и app routes требуют сессии.
- **Зависимости:** F1-01.
- **БД:** нет.
- **Backend:** auth guard middleware.
- **UI:** redirect unauthenticated.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** API без cookie → 401.
- **Приёмка:** аноним не видит ленту / не мутирует API.
- **Риски:** SSR/cookie edge cases.
- **Не входит:** RBAC.

---

## F2 — Research (internal) + Feed shell

### F2-01 — Модель Research
- **Цель:** таблица researches + CRUD API (контейнер pipeline / system feed).
- **Зависимости:** F1-02.
- **БД:** `researches`.
- **Backend:** create/list/get/update.
- **UI:** нет (или secondary).
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** API CRUD + ownership.
- **Приёмка:** ownership 404 на чужой id; модель готова для system feed.
- **Риски:** нет.
- **Не входит:** pipeline trigger; обязательный user-facing create.
- **Статус:** DONE (2026-07-30).

### F2-02 — UI Research list/create (secondary)
- **Цель:** list/create/detail shell для Research (admin/E2E/debug; **не** home).
- **Зависимости:** F2-01.
- **БД:** нет новых.
- **Backend:** использовать API.
- **UI:** list + create form + detail shell.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** smoke create research.
- **Приёмка:** API+UI работают; **не** являются Flow A шагами 1–2 после pivot.
- **Риски:** путаница с primary UX — nav demote.
- **Не входит:** красивый дизайн-система.
- **Статус:** DONE как secondary UI (2026-07-30); supersede primary role → F2-03.

### F2-03 — Ideas feed shell + stats (primary home)
- **Цель:** после login home = `/ideas`: empty/list shell, сводная статистика-заглушка, ссылка на карточку-placeholder; без полного Ideas API (F6).
- **Зависимости:** F1-02, F2-01 (system feed id может появиться позже).
- **БД:** нет новых (ideas table — F5-01); shell без данных или mock empty.
- **Backend:** опционально stub `GET /api/ideas` → `{ ideas: [], stats }`.
- **UI:** feed layout + stats strip + empty state «Идеи появятся после анализа источников».
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** auth → `/ideas`; anonymous → login.
- **Приёмка:** Flow A шаг 2 (лента как home); Research create не обязателен.
- **Риски:** дублирование с F6-01 — F2-03 только shell; F6 наполняет данными.
- **Не входит:** полная карточка, вкладки narrowed/excluded, pipeline status UI.
- **Статус:** DONE (2026-07-30).

---

## F3 — Signals

### F3-01 — Модель Signal + manual create
- **Цель:** signals на **system feed**; manual create для E2E/admin.
- **Зависимости:** F2-01.
- **БД:** `signals`.
- **Backend:** POST/GET signals (привязка к system research).
- **UI:** вторичная форма paste (не primary); E2E может бить API.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** create+list signals на system feed.
- **Приёмка:** ≥3 manual signals (demo/E2E); автозапуск pipeline — при ≥1.
- **Риски:** огромные тексты — лимит длины.
- **Не входит:** адаптеры.

### F3-02 — Source adapters (HN → PH → Reddit)
- **Цель:** подтянуть сигналы из открытых источников в system feed (любые ниши внутри источника).
- **Зависимости:** F3-01, F0-03 (если async).
- **БД:** signals metadata/source_url.
- **Backend:** adapter interface + реализации по порядку HN → PH → Reddit.
- **UI:** кнопка «Обновить ленту» / ingest (на feed, не на user Research).
- **AI:** нет.
- **Фон:** ingest job optional.
- **Тесты:** mock adapter → N signals в system feed.
- **Приёмка:** лента получает сигналы не только manual.
- **Риски:** API keys, rate limits, ToS.
- **Не входит:** краулер всего интернета; 4-й источник.

---

## F4 — Scoring domain (pure)

### F4-01 — Формулы скоров (unit)
- **Цель:** чистые функции OneJob / AIBuildability / FirstSale / TimeFit / Opportunity + filter.
- **Зависимости:** нет кода UI (можно параллельно F3).
- **БД:** нет.
- **Backend:** `domain/scoring/*`.
- **UI:** нет.
- **AI:** нет (детерминизм: int-скоры только из breakdown; LLM заполняет breakdown в F5).
- **Фон:** нет.
- **Тесты:** табличные unit-тесты порогов и штрафов.
- **Приёмка:** совпадение с `AI_PIPELINE.md`.
- **Риски:** дрейф формул vs доки.
- **Не входит:** LLM.

### F4-02 — Narrowing helper
- **Цель:** функция сужения: secondary→excluded features, recalc days gate.
- **Зависимости:** F4-01.
- **БД:** нет.
- **Backend:** pure helper.
- **UI:** нет.
- **AI:** нет / позже LLM предлагает сужение.
- **Фон:** нет.
- **Тесты:** days>14 → after narrow ≤14 or exclude.
- **Приёмка:** правила Части 4 покрыты тестами.
- **Риски:** эвристики сужения слабые без LLM.
- **Не входит:** UI.

---

## F5 — Pipeline jobs

### F5-01 — Модели Idea, PainCluster, PipelineRun
- **Цель:** миграции таблиц.
- **Зависимости:** F0-02, F2-01.
- **БД:** ideas, pain_clusters, pipeline_runs.
- **Backend:** prisma models.
- **UI:** нет.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** migrate.
- **Приёмка:** схема = `DATABASE.md`.
- **Риски:** jsonb vs relations.
- **Не входит:** заполнение данными.

### F5-02 — LLM client + JSON schemas
- **Цель:** обёртка провайдера, structured output schemas.
- **Зависимости:** F0-01.
- **БД:** нет.
- **Backend:** `lib/llm`.
- **UI:** нет.
- **AI:** да (client only).
- **Фон:** нет.
- **Тесты:** mock provider.
- **Приёмка:** вызов mock возвращает валидный JSON.
- **Риски:** стоимость/ключи.
- **Не входит:** промпты всех шагов.

### F5-03 — Pipeline steps wire-up
- **Цель:** job `pipeline.run` выполняет шаги 1–9 из `AI_PIPELINE.md`.
- **Зависимости:** F3-01, F4-01, F4-02, F5-01, F5-02, F0-03.
- **БД:** пишет clusters/ideas/runs.
- **Backend:** orchestration.
- **UI:** нет (API start).
- **AI:** extract/cluster/draft + **score_breakdown** (0/50/100); int-скоры — F4 pure functions.
- **Фон:** pipeline.run.
- **Тесты:** integration с mock LLM → ≥1 idea row.
- **Приёмка:** analyze на фикстурах завершает run=succeeded.
- **Риски:** нестабильность LLM; долгий job.
- **Не входит:** полировка промптов до идеала.

### F5-04 — API start analyze + status
- **Цель:** запуск pipeline и polling статуса (`trigger`: initial | manual | scheduled).
- **Зависимости:** F5-03, F1-02.
- **БД:** pipeline_runs.trigger, researches.last_pipeline_finished_at.
- **Backend:** POST analyze, GET run.
- **UI:** кнопка «Обновить идеи» + status badge.
- **AI:** нет напрямую.
- **Фон:** enqueue.
- **Тесты:** start→queued→succeeded (mock); trigger сохраняется.
- **Приёмка:** нельзя запускать чужой research; duplicate run blocked.
- **Риски:** double-submit — lock/disable; manual cooldown 5 мин на Research (MVP).
- **Не входит:** websocket.

### F5-05 — Автозапуск при первых сигналах (system feed)
- **Цель:** после появления сигналов в system feed — auto `pipeline.run` (`trigger=initial`) без обязательной кнопки.
- **Зависимости:** F5-04, F3-01.
- **БД:** researches.status (system feed).
- **Backend:** hook после create signal / ingest.
- **UI:** индикатор на ленте «Анализ запущен».
- **AI:** нет.
- **Фон:** enqueue initial.
- **Тесты:** system feed + signal → run created.
- **Приёмка:** Flow A шаг 4 без ручного клика.
- **Риски:** запуск до появления сигналов — не стартовать.
- **Не входит:** авто при пустом feed.

### F5-06 — Scheduled refresh (раз в 3 дня)
- **Цель:** cron → pipeline для system feed старше 3 дней (UX-окно актуальности 3–5 дней).
- **Зависимости:** F5-04, F0-03.
- **БД:** researches.auto_refresh_enabled, last_pipeline_finished_at.
- **Backend:** cron query + enqueue scheduled runs (+ re-ingest адаптеров).
- **UI:** метка «Последнее обновление …» на ленте.
- **AI:** нет.
- **Фон:** daily cron + pipeline.run.
- **Тесты:** fixture feed 4 days old → scheduled enqueued; 1 day old → skip.
- **Приёмка:** Flow A2; интервал 3 календарных дня.
- **Риски:** LLM cost — MVP без per-user cap (один system feed).
- **Не входит:** настройка интервала пользователем.

---

## F6 — Ideas UI

### F6-01 — Список recommended (полная лента)
- **Цель:** основной список ленты: фильтр порогов, sort Opportunity Score; заменяет empty shell F2-03.
- **Зависимости:** F5-03, F2-03.
- **БД:** read ideas (system feed / global catalog).
- **Backend:** GET `/api/ideas?status=recommended`.
- **UI:** feed list (primary home).
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** idea ниже порога не в списке.
- **Приёмка:** только 4-порога; auth required.
- **Риски:** пустой список UX — показать excluded count + stats.
- **Не входит:** экспорт PDF.

### F6-02 — Карточка идеи
- **Цель:** все обязательные поля build+sales+scores+template.
- **Зависимости:** F6-01.
- **БД:** read.
- **Backend:** GET idea/:id.
- **UI:** detail sections.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** snapshot/contract полей.
- **Приёмка:** чеклист полей Частей 2–5.
- **Риски:** перегруз UI — секции свернуть.
- **Не входит:** редактор всех полей (кроме F7).

### F6-03 — Excluded list + reasons
- **Цель:** видеть почему идея не в основном списке.
- **Зависимости:** F6-01.
- **БД:** read.
- **Backend:** GET excluded.
- **UI:** secondary tab.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** exclusion_reasons отображаются.
- **Приёмка:** Flow B.
- **Риски:** нет.
- **Не входит:** авто-fix excluded.

### F6-04 — Список narrowed
- **Цель:** вкладка «Суженные» для идей со статусом `narrowed`.
- **Зависимости:** F6-01.
- **БД:** read ideas.
- **Backend:** GET ideas?status=narrowed.
- **UI:** tab + карточка с `featuresExcludedToFitDeadline`.
- **AI:** нет.
- **Фон:** нет.
- **Тесты:** narrowed idea видна во вкладке; recommended-only не дублируется.
- **Приёмка:** Flow C шаг 1.
- **Риски:** путаница narrowed vs excluded — явные labels.
- **Не входит:** авто-promote в recommended без rescore.

---

## F7 — Narrow / rescore

### F7-01 — Edit narrowing fields + rescore
- **Цель:** править secondary/exclusions → job idea.rescore.
- **Зависимости:** F6-02, F4-02, F5-03.
- **БД:** update idea scores/status.
- **Backend:** PATCH + enqueue rescore.
- **UI:** form subset.
- **AI:** optional suggest narrow.
- **Фон:** idea.rescore.
- **Тесты:** после rescore статус может стать recommended.
- **Приёмка:** Flow C.
- **Риски:** гонки с полным pipeline.
- **Не входит:** полный re-ingest.

---

## F8 — Vertical slice QA

### F8-01 — E2E happy path
- **Цель:** автоматизировать Flow A на mock LLM + fixture signals.
- **Зависимости:** F1–F7.
- **БД:** test db.
- **Backend/UI:** полный путь.
- **AI:** mock.
- **Фон:** да.
- **Тесты:** e2e green.
- **Приёмка:** `ACCEPTANCE_CRITERIA.md` § «Ручной happy path» + § «MVP vertical slice».
- **Риски:** flaky e2e.
- **Не входит:** load testing.

### F8-02 — Docs sync + freeze MVP
- **Цель:** обновить STATE, закрыть открытые по MVP.
- **Зависимости:** F8-01.
- **БД:** нет.
- **Backend/UI/AI/Фон:** нет.
- **Тесты:** нет.
- **Приёмка:** `04_STATE` = MVP DONE pending owner.
- **Риски:** scope creep на ревью.
- **Не входит:** post-MVP фичи.

---

## Post-MVP (не планировать в коде сейчас)

Второй адаптер; биллинг AnalyticSaaS; экспорт; улучшения промптов; vector search.
