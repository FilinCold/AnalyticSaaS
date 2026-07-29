# Шаг F5-06 — Scheduled refresh (3 дня)

**Статус:** TODO  
**Слой:** Backend + Frontend  
**Зависит от:** `04-api-analyze-status`, `01-bootstrap/03-job-runner-skeleton`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F5-06) · **Фича:** `06-pipeline-jobs`

## Перед началом

1. `docs/BACKGROUND_JOBS.md` (`research.schedule_refresh`)
2. `docs/MVP_SCOPE.md` Flow A2
3. `docs/ACCEPTANCE_CRITERIA.md` § MVP vertical slice (cron пункт)

## Цель

Daily cron находит Research с `last_pipeline_finished_at` старше 3 календарных дней → enqueue `pipeline.run` trigger=scheduled.

## Не входит

- User-configurable interval
- Per-user rate limit all researches (post-MVP)
- Global niche crawling

## Подзадачи

### 1. Cron job registration

- `research.schedule_refresh` — daily 03:00 UTC (or runner cron syntax)
- Dev: manual trigger endpoint `POST /api/dev/cron/schedule-refresh` (NODE_ENV=development)

### 2. Query logic

```sql
WHERE auto_refresh_enabled = true
  AND last_pipeline_finished_at < now() - interval '3 days'
  AND NOT EXISTS active run (queued|running)
```

Edge: `last_pipeline_finished_at IS NULL` AND research age > 3 days — include or skip (document: **include** if had successful run once; if never run, skip)

### 3. Enqueue

- For each match: create run trigger=scheduled, enqueue pipeline (ingest optional first)

### 4. UI

- Research detail: «Последнее обновление: {date}» from `lastPipelineFinishedAt`
- Optional toggle `autoRefreshEnabled` (PATCH research)

### 5. Tests

- Fixture: finished 4 days ago → enqueued
- Fixture: 1 day ago → skip
- active run → skip

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | 4 days old, enabled | scheduled run created |
| T2 | 1 day old | skip |
| T3 | disabled auto_refresh | skip |
| T4 | active run exists | skip |
| T5 | Flow A2 acceptance | manual checklist |

## Критерии готовности (DoD)

- [ ] T1–T4 automated
- [ ] UI date label
- [ ] Flow A2 documented in test or manual QA

## Как проверить

```bash
npm test -- --grep scheduled
```

## Журнал

- _(пусто)_
