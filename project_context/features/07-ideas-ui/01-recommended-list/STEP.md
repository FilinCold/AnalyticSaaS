# Шаг F6-01 — Список recommended

**Статус:** TODO  
**Слой:** Full stack  
**Зависит от:** `06-pipeline-jobs/03-pipeline-wire-up`, `03-research/02-ui-list-create`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F6-01) · **Фича:** `07-ideas-ui`

## Перед началом

1. `docs/DOMAIN_MODEL.md` (инварианты recommended)
2. `docs/API.md` § Ideas
3. `docs/USER_FLOWS.md` Flow A шаг 6

## Цель

Вкладка «Рекомендованные»: только 4-порога; сортировка Opportunity DESC; empty state с hint на excluded.

## Не входит

- Карточка detail (F6-02)
- Excluded/narrowed tabs (F6-03, F6-04)
- Export

## Подзадачи

### 1. API `GET /api/researches/[id]/ideas?status=recommended`

- Server-side filter: status=recommended (DB should already match thresholds post-pipeline)
- Double-check guard in API: re-validate thresholds (defense in depth)
- Sort opportunityScore DESC
- Response: summary fields for list row

### 2. UI route

- `app/(app)/researches/[id]/ideas/page.tsx` — default tab recommended
- Tabs shell (placeholders for excluded/narrowed — F6-03/04)
- Table: problem, oneJobScore, opportunityScore, estimatedBuildDays, link to card

### 3. Empty state

- «Нет рекомендованных идей»
- Link: «Посмотреть исключённые (N)» if count > 0

### 4. Tests

- Seed idea below threshold → not in list
- Seed recommended → appears first by opportunity

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | 2 recommended different opportunity | higher first |
| T2 | excluded idea | not in list |
| T3 | empty recommended | empty state + excluded hint |
| T4 | Flow A step 6 | manual |

## Критерии готовности (DoD)

- [ ] T1–T4
- [ ] Tab navigation structure ready for F6-03/04

## Как проверить

```bash
npm test -- --grep recommended
```

## Журнал

- _(пусто)_
