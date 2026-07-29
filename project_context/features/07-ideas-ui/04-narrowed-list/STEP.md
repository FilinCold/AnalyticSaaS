# Шаг F6-04 — Список narrowed

**Статус:** TODO  
**Слой:** Full stack  
**Зависит от:** `01-recommended-list`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F6-04) · **Фича:** `07-ideas-ui`

## Перед началом

1. `docs/DECISIONS.md` (UI narrowed tab)
2. `docs/USER_FLOWS.md` Flow C шаг 1

## Цель

Вкладка «Суженные» для `status=narrowed`; highlight `featuresExcludedToFitDeadline`.

## Не входит

- Rescore form (F7)
- Auto-promote to recommended without rescore

## Подзадачи

### 1. API `?status=narrowed`

### 2. UI tab «Суженные»

- Badge «Сужено системой»
- List excluded features prominently
- CTA link: «Открыть карточку» → F6-02
- Label clarity: не путать с «Исключённые»

### 3. Tests

- narrowed visible only in this tab
- recommended not duplicated here

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | narrowed idea | in tab, features shown |
| T2 | recommended | not in narrowed tab |
| T3 | Flow C step 1 | manual |

## Критерии готовности (DoD)

- [ ] T1–T3
- [ ] Three tabs work: Рекомендованные / Суженные / Исключённые

## Как проверить

```bash
npm test -- --grep narrowed
```

## Журнал

- _(пусто)_
