# Шаг F6-03 — Excluded list + reasons

**Статус:** TODO  
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

### 1. API

- `GET .../ideas?status=excluded`
- Map reason codes → русские labels: `below_one_job`, `below_ai`, `below_first_sale`, `exceeds_14_days`, `platform_idea`

### 2. UI tab

- `.../ideas/excluded` or query tab `?tab=excluded`
- List: problem, reasons chips, scores summary
- Link to read-only card (same F6-02 page, banner «Исключена»)

### 3. Tests

- Fixture excluded → reasons visible in HTML/test

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | excluded with 2 reasons | both shown |
| T2 | recommended not in tab | |
| T3 | Flow B | manual |

## Критерии готовности (DoD)

- [ ] T1–T3

## Как проверить

```bash
npm test -- --grep excluded
```

## Журнал

- _(пусто)_
