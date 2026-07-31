# Шаг F6-04 — Список narrowed

**Статус:** DONE  
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

### 1. API `?status=narrowed` ✅

- `listIdeasFeed('narrowed')` + `featuresExcludedToFitDeadline` в list serialize

### 2. UI tab «Суженные» ✅

- Badge «Сужено системой»
- List excluded features prominently
- CTA link: «Открыть карточку» → F6-02
- Label clarity: не путать с «Исключённые»
- Card banner «Сужено системой»

### 3. Tests ✅

- narrowed visible only in this tab
- recommended not duplicated here

## Тест-кейсы

| # | Сценарий | Статус |
|---|---|---|
| T1 | narrowed idea | ✅ in tab, features shown (API + UI) |
| T2 | recommended | ✅ not in narrowed tab |
| T3 | Flow C step 1 | ⏳ owner browser |

## Критерии готовности (DoD)

- [x] T1–T2
- [ ] T3 owner Flow C
- [x] Three tabs work: Рекомендованные / Суженные / Исключённые

## Как проверить

```bash
cd AnalyticProject
npm test -- -t "narrowed|T1 narrowed|T2 narrowed"
npm run lint && LLM_PROVIDER=mock npm test && npm run build
```

**Браузер:** `/ideas?tab=narrowed` → features chips + badge; карточка narrowed → banner «Сужено системой».

## Журнал

- `2026-07-31` — DONE: list serialize features; `NarrowedIdeasTable`; tab wire; card banner; **157** tests.
