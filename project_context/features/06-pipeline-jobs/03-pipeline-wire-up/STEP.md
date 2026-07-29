# Шаг F5-03 — Pipeline steps wire-up

**Статус:** TODO  
**Слой:** Backend · Jobs  
**Зависит от:** F3-01, F4-01, F4-02, F5-01, F5-02, F0-03  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F5-03) · **Фича:** `06-pipeline-jobs`

**Подшаги (строго по порядку):**

| # | Папка | Pipeline step |
|---|---|---|
| 1 | [01-orchestrator-shell](./01-orchestrator-shell/STEP.md) | Job shell + run state machine |
| 2 | [02-normalize-ingest](./02-normalize-ingest/STEP.md) | ingest (opt) + normalize |
| 3 | [03-extract-cluster](./03-extract-cluster/STEP.md) | extract_pains + cluster |
| 4 | [04-draft-ideas](./04-draft-ideas/STEP.md) | draft_ideas → candidate rows |
| 5 | [05-estimate-narrow](./05-estimate-narrow/STEP.md) | estimate_build + F4-02 narrow |
| 6 | [06-score-filter-finish](./06-score-filter-finish/STEP.md) | score + filter + persist + finish |

## Перед началом

1. `docs/AI_PIPELINE.md` (шаги 1–9)
2. `docs/BACKGROUND_JOBS.md` (`pipeline.run`)
3. `docs/LLM_CONTRACT.md`
4. Все зависимости завершены

## Цель

Job `pipeline.run` выполняет полный pipeline; на mock LLM + fixture signals → `run.status=succeeded`, ≥1 idea row.

## Не входит

- HTTP API start (F5-04)
- Auto initial trigger (F5-05)
- Cron (F5-06)
- Идеальный prompt tuning

## Подзадачи

См. подшаги 1–6.

## Поведение run

| Поле | Значения |
|---|---|
| `pipeline_runs.status` | queued → running → succeeded \| failed |
| `current_step` | ingest, normalize, extract, cluster, draft, estimate, score, filter, finish |
| On error | status=failed, error=user-safe message, no stack trace to client |
| Idempotency | Новый run: delete previous `candidate`/`excluded` ideas for research; keep `recommended` until success (см. BACKGROUND_JOBS) |

## Тест-кейсы (интеграция)

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | Run with 3 fixture signals + mock LLM | succeeded |
| T2 | Run with 0 signals | failed or skip at start |
| T3 | LLM throws once | retry then fail OR succeed per policy |
| T4 | At least 1 idea in DB | candidate or final status |
| T5 | score_breakdown stored | jsonb non-empty |
| T6 | research.status = ready after finish | |
| T7 | last_pipeline_finished_at set | |

## Блокеры

- F0-03 runner, F5-02 mock fixtures

## Критерии готовности (DoD)

- [ ] Подшаги 1–6 DONE
- [ ] T1–T7 green
- [ ] Terminal status только `succeeded`/`failed` (не `done`)

## Как проверить

```bash
LLM_PROVIDER=mock npm test -- --grep pipeline
```

## Журнал

- _(пусто)_
