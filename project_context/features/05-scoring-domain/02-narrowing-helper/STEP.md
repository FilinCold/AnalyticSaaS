# Шаг F4-02 — Narrowing helper

**Статус:** TODO  
**Слой:** Backend · Domain (pure)  
**Зависит от:** `01-score-formulas`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F4-02) · **Фича:** `05-scoring-domain`

## Перед началом

1. `docs/AI_PIPELINE.md` § Сужение
2. `docs/DOMAIN_MODEL.md` (status narrowed)
3. `docs/USER_FLOWS.md` (Flow C)

## Цель

Pure function: при `estimatedBuildDays > 14` применить правила сужения → обновить `featuresExcludedToFitDeadline`, пересчитать days; иначе `excluded`.

## Не входит

- LLM suggest narrow (опционально в F5/F7)
- UI
- DB persistence (вызывающий код в F5)

## Подзадачи

### 1. API функции

```typescript
type NarrowingInput = {
  estimatedBuildDays: number;
  secondaryFeatures: string[];
  featuresAlreadyExcluded: string[];
  canManualFallback: boolean;
};

type NarrowingResult =
  | { action: 'ok'; estimatedBuildDays: number; featuresExcluded: string[] }
  | { action: 'narrowed'; estimatedBuildDays: number; featuresExcluded: string[] }
  | { action: 'exclude'; reason: 'exceeds_14_days' };
```

### 2. Алгоритм (детерминированный MVP)

1. Если days ≤ 14 → `ok`
2. Иначе: перенести secondary features → `featuresExcluded` (по приоритету списка)
3. Пересчёт days: `days' = days - 2 * count(excluded)` (эвристика MVP — зафиксировать в коде)
4. Если days' ≤ 14 → `narrowed`
5. Если `canManualFallback` → ещё −2 days once
6. Иначе → `exclude`

_(Точная эвристика может уточняться — главное покрыть тестами и документировать в журнале.)_

### 3. Integration с filter.ts

- После narrow: re-run F4-01 scores if breakdown adjusted (caller responsibility)

### 4. Tests

- days=16, 2 secondary → narrowed ≤14
- days=20, no secondary → exclude
- already excluded features not duplicated

## Файлы

- `AnalyticProject/src/domain/scoring/narrowing.ts`
- `AnalyticProject/src/domain/scoring/narrowing.test.ts`

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | days=12 | action=ok |
| T2 | days=16 + 2 secondary | narrowed, days≤14 |
| T3 | days=20, no features | exclude exceeds_14_days |
| T4 | Duplicate exclude | no dup in array |

## Блокеры

Нет.

## Критерии готовности (DoD)

- [ ] T1–T4 green
- [ ] Правила Части 4 отражены в тестах (комментарий-ссылка)

## Как проверить

```bash
npm test -- --grep narrow
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F5-01.

## Журнал

- _(пусто)_
