# Подшаг F5-03.6 — Score, filter, finish

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md) · **После:** 05-estimate-narrow

## Цель

LLM `score_breakdown` → F4 int scores → filter status → finish run.

## Что сделать

1. LLM score_breakdown per idea
2. F4: compute oneJob, aiBuildability, firstSale, timeFit, opportunity
3. F4 filter: recommended | narrowed | excluded + exclusionReasons
4. Persist scores + score_breakdown jsonb
5. `research.status = ready` (or `failed` if all excluded — still succeeded run)
6. `pipeline_run.status = succeeded`, `finishedAt=now`, `research.lastPipelineFinishedAt=now`
7. Cleanup old candidate/excluded from previous runs per BACKGROUND_JOBS idempotency

## DoD

- [x] Full integration test T1 from parent STEP passes
- [x] recommended fixture has all 4 thresholds OR excluded with reasons

## Журнал

- `2026-07-31` — score+filter+finish; T1/T2/T4–T7 green; old ideas cleaned on success.
