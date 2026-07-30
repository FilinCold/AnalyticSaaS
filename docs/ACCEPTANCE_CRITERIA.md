# ACCEPTANCE_CRITERIA — критерии приёмки

## Продукт (идеи)

- [ ] Основной список (лента) содержит только идеи с One Job ≥ 80, AI Buildability ≥ 75, days ≤ 14, First Sale ≥ 70.
- [ ] У recommended заполнены: one-job шаблон, 6 атрибутов, build-поля Части 4, sales-поля Части 5.
- [ ] Opportunity Score используется для сортировки recommended.
- [ ] Идеи-платформы/CRM/ERP и т.п. не попадают в recommended (через скоры/exclude).
- [ ] Лайки/интерес не маркируются как достаточное подтверждение спроса в текстах go/kill.
- [ ] После входа primary screen — **лента идей** (+ stats), не форма создания Research.

## MVP vertical slice (полный чеклист приёмки продукта)

> Ручной happy path для E2E — подмножество (без пункта про scheduled). См. `MVP_SCOPE.md` § «Ручной happy path».

- [ ] Регистрация/вход → редирект на ленту.
- [ ] Лента / stats shell доступны без создания Research пользователем.
- [ ] ≥3 сигнала в system feed для demo/E2E (автозапуск pipeline — при ≥1).
- [ ] Первый прогон ленты запускается автоматически при наличии сигналов.
- [ ] Кнопка «Обновить ленту» запускает manual pipeline.
- [ ] Scheduled job обновляет system feed раз в 3 календарных дня.
- [ ] Запуск pipeline → terminal status succeeded/failed; `trigger` сохраняется.
- [ ] При succeeded: recommended в ленте и/или excluded с причинами.
- [ ] Карточка recommended показывает все обязательные поля.
- [ ] Rescore после сужения обновляет скоры/статус.
- [ ] Вкладка «Суженные» показывает `narrowed` идеи (Flow C).

## Ручной happy path (E2E F8-01, без cron)

- [ ] Регистрация/вход → лента → ≥3 сигнала (seed/adapter) → pipeline (auto/manual) → succeeded → recommended/excluded → карточка.
- [ ] Rescore после сужения (опционально в E2E).

## Технические

- [ ] Миграции применяются на чистой БД.
- [ ] Unit-тесты формул скоринга зелёные и соответствуют `AI_PIPELINE.md`.
- [ ] E2E happy path на mock LLM зелёный.
- [ ] Секреты LLM не попадают в клиентский бандл.
- [ ] Аноним не видит ленту (401 / redirect login).
- [ ] Research API ownership: чужой user research id → 404 (internal API; system feed — отдельно).

## Вне приёмки MVP

Биллинг, orgs, адаптеры сверх HN/PH/Reddit, кодоген micro-SaaS, мобильное приложение, PDF export, UGC-маркетплейс.
