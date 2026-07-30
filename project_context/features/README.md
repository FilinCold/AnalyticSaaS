# Features — очередь реализации

> SSOT деталей шагов: [`docs/ROADMAP.md`](../../docs/ROADMAP.md).  
> Шаблон карточки: [`../step-TEMPLATE.md`](../step-TEMPLATE.md).  
> Прогресс: [`../04_STATE.md`](../04_STATE.md).

## Контракты (SSOT для реализации)

| Документ | Содержание |
|---|---|
| [`docs/API.md`](../../docs/API.md) | REST endpoints, коды ошибок |
| [`docs/LLM_CONTRACT.md`](../../docs/LLM_CONTRACT.md) | JSON schemas pipeline |
| [`docs/IDEA_CARD_SPEC.md`](../../docs/IDEA_CARD_SPEC.md) | Поля карточки идеи |
| [`docs/DATABASE.md`](../../docs/DATABASE.md) | Prisma / таблицы |
| [`docs/AI_PIPELINE.md`](../../docs/AI_PIPELINE.md) | Формулы скоров |

## Порядок

```
01-bootstrap → 02-auth → 03-research → 04-signals
    → 05-scoring-domain → 06-pipeline-jobs → 07-ideas-ui
    → 08-narrow-rescore → 09-vertical-slice-qa
```

Критический путь: 01→02→03→04→05→06→07. 08 после 07. 09 в конце.  
`05-scoring-domain` можно параллельно с `04-signals` (pure domain).

## Дерево

| # | Фича | Шаги | Подшаги | ROADMAP |
|---|---|---|---|---|
| 01 | [bootstrap](./01-bootstrap/) | 01-app-scaffold, 02-prisma-postgres, 03-job-runner-skeleton | F0-01 (3), F0-03 (3) | F0 |
| 02 | [auth](./02-auth/) | 01-register-login, 02-api-protection | F1-01 (3) | F1 |
| 03 | [research](./03-research/) | 01-model-crud, 02-ui-list-create, **03-ideas-feed-shell** | — | F2 |
| 04 | [signals](./04-signals/) | 01-manual-signal, 02-source-adapter | — | F3 |
| 05 | [scoring-domain](./05-scoring-domain/) | 01-score-formulas, 02-narrowing-helper | — | F4 |
| 06 | [pipeline-jobs](./06-pipeline-jobs/) | 01-models … 06-scheduled-refresh | **F5-03 (6)** | F5 |
| 07 | [ideas-ui](./07-ideas-ui/) | 01-recommended-list … 04-narrowed-list | F6-02 (3) | F6 |
| 08 | [narrow-rescore](./08-narrow-rescore/) | 01-edit-rescore | — | F7 |
| 09 | [vertical-slice-qa](./09-vertical-slice-qa/) | 01-e2e-happy-path, 02-docs-sync | — | F8 |

**Итого:** 9 эпиков · 24 шага · **15 вложенных подшагов** (в сложных шагах).

## Как работать

1. Открыть текущий `STEP.md` в очереди (и подшаги, если есть таблица «Подшаги»).
2. Прочитать «Перед началом» + SSOT из `docs/`.
3. Реализовать подзадачи по порядку → DoD → тест-кейсы → журнал.
4. Статус шага → `DONE` → обновить:
   - `STEP.md` (статус + журнал)
   - README этой фичи (`features/NN-…/README.md`)
   - `04_STATE.md`

## Статусы

| Фича | Статус |
|---|---|
| 01-bootstrap | **DONE** |
| 02-auth | **DONE** |
| 03-research | **DONE** (F2-01/02/03; home = Ideas feed) |
| 04-signals … 09 | TODO |

Детализация STEP.md: **DONE** (`2026-07-29`).  
**Pivot UX** `2026-07-30`: лента идей, без обязательного user Research.  
Текущий следующий: **F3-01** — [`04-signals/01-manual-signal`](./04-signals/01-manual-signal/STEP.md).
