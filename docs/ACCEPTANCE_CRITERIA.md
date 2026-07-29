# ACCEPTANCE_CRITERIA — критерии приёмки

## Продукт (идеи)

- [ ] Основной список содержит только идеи с One Job ≥ 80, AI Buildability ≥ 75, days ≤ 14, First Sale ≥ 70.
- [ ] У recommended заполнены: one-job шаблон, 6 атрибутов, build-поля Части 4, sales-поля Части 5.
- [ ] Opportunity Score используется для сортировки recommended.
- [ ] Идеи-платформы/CRM/ERP и т.п. не попадают в recommended (через скоры/exclude).
- [ ] Лайки/интерес не маркируются как достаточное подтверждение спроса в текстах go/kill.

## MVP vertical slice (полный чеклист приёмки продукта)

> Ручной happy path для E2E — подмножество (без пункта про scheduled). См. `MVP_SCOPE.md` § «Ручной happy path».

- [ ] Регистрация/вход.
- [ ] Создание Research.
- [ ] ≥3 сигнала для demo/E2E (автозапуск pipeline — при ≥1).
- [ ] Первый прогон Research запускается автоматически при наличии сигналов.
- [ ] Кнопка «Обновить идеи» запускает manual pipeline.
- [ ] Scheduled job обновляет активные Research раз в 3 календарных дня.
- [ ] Запуск pipeline → terminal status succeeded/failed; `trigger` сохраняется.
- [ ] При succeeded: recommended и/или excluded с причинами.
- [ ] Карточка recommended показывает все обязательные поля.
- [ ] Rescore после сужения обновляет скоры/статус.
- [ ] Вкладка «Суженные» показывает `narrowed` идеи (Flow C).

## Ручной happy path (E2E F8-01, без cron)

- [ ] Регистрация/вход → Research → ≥3 сигнала → pipeline (auto/manual) → succeeded → recommended/excluded → карточка.
- [ ] Rescore после сужения (опционально в E2E).

## Технические

- [ ] Миграции применяются на чистой БД.
- [ ] Unit-тесты формул скоринга зелёные и соответствуют `AI_PIPELINE.md`.
- [ ] E2E happy path на mock LLM зелёный.
- [ ] Секреты LLM не попадают в клиентский бандл.
- [ ] Пользователь A не видит research пользователя B.

## Вне приёмки MVP

Биллинг, orgs, адаптеры сверх HN/PH/Reddit, кодоген micro-SaaS, мобильное приложение, PDF export.
