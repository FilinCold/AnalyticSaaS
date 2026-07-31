# Шаг F6-02 — Карточка идеи

**Статус:** DONE  
**Слой:** Full stack  
**Зависит от:** `01-recommended-list`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F6-02) · **Фича:** `07-ideas-ui`

**Подшаги (UI секции):**

| # | Папка | Секция |
|---|---|---|
| a | [a-api-detail](./a-api-detail/STEP.md) | GET full idea API — DONE |
| b | [b-onejob-scores](./b-onejob-scores/STEP.md) | One Job + скоры — DONE |
| c | [c-build-sales](./c-build-sales/STEP.md) | Build + Sales блоки — DONE |

## Перед началом

1. `docs/IDEA_CARD_SPEC.md` (SSOT полей)
2. `docs/ACCEPTANCE_CRITERIA.md` § карточка
3. `docs/USER_FLOWS.md` Flow A шаг 7

## Цель

Detail page со всеми обязательными полями; contract test; collapsible sections.

## Не входит

- Редактирование полей (кроме F7 subset)
- PDF export

## Подзадачи

См. подшаги a → b → c.

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | GET recommended fixture | all IDEA_CARD_SPEC fields present |
| T2 | Contract/snapshot test | no missing keys |
| T3 | continue/stop criteria visible | go/kill labels |
| T4 | fourteenDayBuildPlan rendered | day/tasks |
| T5 | Flow A step 7 | ✅ owner |

## Критерии готовности (DoD)

- [x] Подшаги a,b,c DONE
- [x] T1–T5

## Как проверить

```bash
npm test -- -t idea-card
```

## Журнал

- `2026-07-31` — a/b/c DONE; API + UI sections; **144** tests; T5 owner Flow A step 7.
- `2026-07-31` — Owner verify T5: карточка recommended (One Job / Скоры / Build).
