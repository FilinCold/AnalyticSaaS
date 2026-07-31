# Шаг F6-01 — Список recommended

**Статус:** DONE  
**Слой:** Full stack  
**Зависит от:** `06-pipeline-jobs/03-pipeline-wire-up`, `03-research/03-ideas-feed-shell`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F6-01) · **Фича:** `07-ideas-ui`

## Перед началом

1. `docs/DOMAIN_MODEL.md` (инварианты recommended)
2. `docs/API.md` § Ideas
3. `docs/USER_FLOWS.md` Flow A шаг 6

## Цель

Лента `/ideas` «Рекомендованные»: только 4-порога; сортировка Opportunity DESC; empty state с hint на excluded.

## Не входит

- Карточка detail (F6-02)
- Excluded/narrowed tabs content (F6-03, F6-04) — только shell вкладок
- Export
- Secondary `GET /api/researches/:id/ideas` (internal; не primary UX после pivot)

## Подзадачи

### 1. API `GET /api/ideas?status=recommended` ✅

- System feed ideas; default status=`recommended`
- Guard: `passesRecommendedGuard` (4 порога + template)
- Sort `opportunityScore DESC`
- Response: list fields + `stats` (counts + lastPipelineFinishedAt)

### 2. UI `/ideas` ✅

- Tabs shell (recommended active; narrowed/excluded placeholders)
- Table: problem, oneJobScore, opportunityScore, estimatedBuildDays, link → `/ideas/[id]` (F6-02)
- Stats из реального feed

### 3. Empty state ✅

- «Нет рекомендованных идей»
- Link: «Посмотреть исключённые (N)» if count > 0

### 4. Tests ✅

- T1–T3 + guard unit + invalid status 400

## Тест-кейсы

| # | Сценарий | Статус |
|---|---|---|
| T1 | 2 recommended different opportunity | ✅ higher first |
| T2 | excluded / below-threshold | ✅ not in list |
| T3 | empty recommended | ✅ empty + excludedCount in stats |
| T4 | Flow A step 6 | ✅ owner browser |

## Критерии готовности (DoD)

- [x] T1–T3 (+ guard)
- [x] Tab navigation structure ready for F6-03/04
- [x] T4 owner Flow A

## Как проверить

```bash
cd AnalyticProject
npm test -- -t "GET /api/ideas|passesRecommendedGuard"
npm run lint && LLM_PROVIDER=mock npm test && npm run build
```

**Браузер:** `/ideas` → вкладки + таблица или empty + hint на excluded.

## Журнал

- `2026-07-31` — DONE: `listIdeasFeed` + guard; `GET /api/ideas`; UI tabs/table/empty; **138** tests. STEP выровнен с ROADMAP/pivot (`/api/ideas`, не research-scoped).
- `2026-07-31` — Owner verify T4: лента + recommended после pipeline.
