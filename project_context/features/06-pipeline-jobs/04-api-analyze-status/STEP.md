# Шаг F5-04 — API analyze + status

**Статус:** TODO  
**Слой:** Full stack  
**Зависит от:** `03-pipeline-wire-up`, `02-auth/02-api-protection`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F5-04) · **Фича:** `06-pipeline-jobs`

## Перед началом

1. `docs/API.md` § Pipeline
2. `docs/BACKGROUND_JOBS.md`
3. `docs/DECISIONS.md` (rate limit, trigger, succeeded)
4. `docs/USER_FLOWS.md` (Flow D retry)

## Цель

POST analyze enqueue `pipeline.run`; GET status; UI кнопка «Обновить идеи» + badge; duplicate lock + manual cooldown 5 мин.

## Не входит

- Auto initial (F5-05)
- Cron (F5-06)
- WebSocket

## Подзадачи

### 1. POST analyze

- `POST /api/researches/[id]/analyze`
- Create `PipelineRun` status=queued, trigger=manual (or from body)
- Enqueue job via F0-03 runner
- Guards:
  - ownership
  - signals count ≥ 1
  - no active run (queued|running) → 409
  - manual: last manual start < 5 min ago → 409

### 2. GET status

- `GET /api/researches/[id]/pipeline-runs/latest`
- `GET /api/researches/[id]/pipeline-runs/[runId]`
- Include in research detail payload optionally

### 3. UI components

- `PipelineStatusBadge`: queued/running/succeeded/failed (UX: «В очереди»/«Анализ…»/«Готово»/«Ошибка»)
- Button «Обновить идеи» — disabled when running or cooldown
- Flow D: on failed — show error + «Повторить анализ»

### 4. Polling

- Client poll every 3s while running (or SWR refresh)

### 5. Tests

- start→mock complete→succeeded
- duplicate → 409
- wrong user → 404

## API / схема / поля

`docs/API.md` § Pipeline.

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | POST analyze valid | 202, run queued |
| T2 | Second POST while running | 409 |
| T3 | Manual within 5 min | 409 |
| T4 | No signals | 422 |
| T5 | GET latest | correct status progression |
| T6 | trigger=manual saved | |
| T7 | Чужой research | 404 |

## Критерии готовности (DoD)

- [ ] T1–T7
- [ ] UI badge + button on research detail

## Как проверить

```bash
npm test -- --grep analyze
```

## Журнал

- _(пусто)_
