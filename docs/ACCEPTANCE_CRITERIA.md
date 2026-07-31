# ACCEPTANCE_CRITERIA — критерии приёмки

> **F8-02 (2026-07-31):** чеклист отражает реализованный MVP.  
> **Owner (2026-07-31):** **MVP ACCEPTED** («MVP ок»). Conscious deferrals MVP: нет.

## Продукт (идеи)

- [x] Основной список (лента) содержит только идеи с One Job ≥ 80, AI Buildability ≥ 75, days ≤ 14, First Sale ≥ 70.
- [x] У recommended заполнены: one-job шаблон, 6 атрибутов, build-поля Части 4, sales-поля Части 5.
- [x] Opportunity Score используется для сортировки recommended.
- [x] Идеи-платформы/CRM/ERP и т.п. не попадают в recommended (через скоры/exclude).
- [x] Лайки/интерес не маркируются как достаточное подтверждение спроса в текстах go/kill.
- [x] После входа primary screen — **лента идей** (+ stats), не форма создания Research.

## MVP vertical slice (полный чеклист приёмки продукта)

> Ручной happy path для E2E — подмножество (без пункта про scheduled). См. `MVP_SCOPE.md` § «Ручной happy path».

- [x] Регистрация/вход → редирект на ленту.
- [x] Лента / stats shell доступны без создания Research пользователем.
- [x] ≥3 сигнала в system feed для demo/E2E (автозапуск pipeline — при ≥1).
- [x] Первый прогон ленты запускается автоматически при наличии сигналов (`trigger=initial`).
- [x] Кнопка «Обновить ленту» → ingest адаптеров; повторный анализ — «Обновить идеи» / `POST …/analyze` (`trigger=manual`).
- [x] Scheduled job обновляет system feed раз в 3 календарных дня.
- [x] Запуск pipeline → terminal status succeeded/failed; `trigger` сохраняется.
- [x] При succeeded: recommended в ленте и/или excluded с причинами.
- [x] Карточка recommended показывает все обязательные поля.
- [x] Rescore после сужения обновляет скоры/статус.
- [x] Вкладка «Суженные» показывает `narrowed` идеи (Flow C).

## Ручной happy path (E2E F8-01, без cron)

- [x] Регистрация/вход → лента → ≥3 сигнала (seed/adapter) → pipeline (auto/manual) → succeeded → recommended/excluded → карточка.
- [x] Rescore после сужения (опционально в E2E; покрыто unit/API/UI тестами F7-01).

## Технические

- [x] Миграции применяются на чистой БД.
- [x] Unit-тесты формул скоринга зелёные и соответствуют `AI_PIPELINE.md`.
- [x] E2E happy path на mock LLM зелёный.
- [x] Секреты LLM не попадают в клиентский бандл.
- [x] Аноним не видит ленту (401 / redirect login).
- [x] Research API ownership: чужой user research id → 404 (internal API; system feed — отдельно).

## Вне приёмки MVP

Биллинг, orgs, адаптеры сверх HN/PH/Reddit, кодоген micro-SaaS, мобильное приложение, PDF export, UGC-маркетплейс, production deploy.
