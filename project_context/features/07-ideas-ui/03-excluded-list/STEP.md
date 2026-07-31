# Шаг F6-03 — Excluded list + reasons

**Статус:** DONE  
**Слой:** Full stack  
**Зависит от:** `01-recommended-list`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F6-03) · **Фича:** `07-ideas-ui`

## Перед началом

1. `docs/USER_FLOWS.md` Flow B
2. `docs/DOMAIN_MODEL.md` (excluded + exclusionReasons)

## Цель

Вкладка «Исключённые»; показ `exclusionReasons` человекочитаемо.

## Не входит

- Auto-fix excluded ideas
- Re-run pipeline from excluded row (use global «Обновить идеи»)

## Подзадачи

### 1. API ✅

- `GET .../ideas?status=excluded` (через `listIdeasFeed`)
- Map reason codes → русские labels: `below_one_job`, `below_ai`, `below_first_sale`, `exceeds_14_days`, `platform_idea` (+ `missing_one_job_template`)

### 2. UI tab ✅

- `?tab=excluded`
- List: problem, reasons chips, scores summary
- Link to read-only card (F6-02) + banner «Исключена»

### 3. Tests ✅

- Fixture excluded → reasons visible in HTML/test

## Тест-кейсы

| # | Сценарий | Статус |
|---|---|---|
| T1 | excluded with 2 reasons | ✅ both shown (API + UI labels) |
| T2 | recommended not in tab | ✅ |
| T3 | Flow B | ⏳ owner browser |

## Критерии готовности (DoD)

- [x] T1–T2
- [ ] T3 owner Flow B

## Как проверить

```bash
cd AnalyticProject
npm test -- -t "exclusion reason|excluded-list|T1 excluded|T2 excluded"
npm run lint && LLM_PROVIDER=mock npm test && npm run build
```

**Браузер:** `/ideas?tab=excluded` → reasons chips; карточка excluded → banner «Исключена».

## Журнал

- `2026-07-31` — DONE: `exclusion-reasons` labels; `ExcludedIdeasTable`; tab content; card banner; Provenance RU labels; **152** tests.
