# Шаг F4-01 — Формулы скоров

**Статус:** DONE  
**Слой:** Backend · Domain (pure)  
**Зависит от:** — (параллельно F3)  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F4-01) · **Фича:** `05-scoring-domain`

## Перед началом

1. `docs/AI_PIPELINE.md` (все формулы)
2. `docs/DECISIONS.md` (LLM breakdown vs F4 int scores)
3. `docs/DOMAIN_MODEL.md` (инварианты порогов)

## Цель

Pure functions: OneJob, AIBuildability, FirstSale, TimeFit, Opportunity, `applyRecommendedFilter`; unit-тесты = SSOT формул.

## Не входит

- LLM вызовы
- Prisma / DB
- UI

## Подзадачи

### 1. Модуль структура

```
src/domain/scoring/
  types.ts          # ScoreBreakdown input types
  oneJob.ts
  aiBuildability.ts
  firstSale.ts
  timeFit.ts
  opportunity.ts
  filter.ts         # recommended | narrowed | excluded
  index.ts
```

### 2. Реализация формул

- Каждый критерий 0|50|100 → `round(avg(...))`
- FirstSale: negatives −8 each, floor 0
- TimeFit: steps 10/12/14 days
- Opportunity: 0.30/0.25/0.30/0.15 weights
- Filter: 4 порога + oneJobTemplate non-empty
- Hard gate: missing template → max OneJob 59 or exclude

### 3. Table-driven tests

Файлы `*.test.ts` с cases из `AI_PIPELINE.md`:
- ideal scores → recommended
- below each threshold → excluded
- platform idea pattern → low OneJob

### 4. No side effects

- eslint rule / code review: no fetch, no prisma in `domain/scoring`

## Файлы

- `AnalyticProject/src/domain/scoring/**`

## API / схема / поля

Input: `ScoreBreakdown` (from LLM_CONTRACT). Output: int scores + `IdeaStatus`.

## Тест-кейсы

| # | Сценарий | Ожидание | Статус |
|---|---|---|---|
| T1 | All criteria 100 | OneJob=100, passes filter | ✅ |
| T2 | OneJob avg 79 | excluded below_one_job | ✅ |
| T3 | 2 FirstSale negatives | −16 from raw | ✅ |
| T4 | days=15 | TimeFit=0, excluded | ✅ |
| T5 | Opportunity weights | manual calc match | ✅ |
| T6 | Empty oneJobTemplate | not recommended | ✅ |

## Блокеры

Нет.

## Критерии готовности (DoD)

- [x] T1–T6 + ≥15 table cases total (34)
- [x] `npm test -- -t scoring` green
- [x] Комментарий в index: SSOT = AI_PIPELINE.md

## Как проверить

```bash
npm test -- -t scoring
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F4-02.

## Журнал

- `2026-07-31` — `src/domain/scoring/*`: OneJob/AI/FirstSale/TimeFit/Opportunity + filter; hard gate template→cap 59; 34 table cases; lint/test/build OK.
