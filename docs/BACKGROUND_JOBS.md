# BACKGROUND_JOBS — фоновые задачи MVP

## Runner

**Inngest** (`DECISIONS.md` § 2026-07-29). BullMQ отклонён для MVP.

## Триггеры `pipeline.run` (SSOT)

| Триггер | Когда | Кто инициирует |
|---|---|---|
| `initial` | Первый прогон Research после появления сигналов | система (`maybeTriggerInitialPipeline` после ingest / manual signal) |
| `manual` | Пользователь нажал «Обновить идеи» (research detail) | пользователь → `POST …/analyze` |
| `scheduled` | Прошло ≥3 календарных дня с `last_pipeline_finished_at` | cron Inngest `0 3 * * *` |

> UI «Обновить ленту» = `POST /api/ideas/ingest` (адаптеры). Pipeline при этом стартует только как `initial` (если ещё не было), не как `manual`.

Все триггеры вызывают один и тот же job `pipeline.run`.

## Job: `pipeline.run`

**API:** `POST /researches/:id/analyze` (manual; initial может вызываться сервером без отдельной кнопки)  
**Вход:** `researchId`, `pipelineRunId`, `trigger` (`initial` | `manual` | `scheduled`)  
**Шаги (последовательные):**

| Step | Действие | Запись в БД |
|---|---|---|
| `ingest` (optional) | подтянуть новые сигналы адаптером | signals |
| `normalize` | очистка текстов сигналов | signals.normalized_text |
| `extract` | LLM боли | metadata |
| `cluster` | кластеры | pain_clusters |
| `draft_ideas` | кандидаты идей | ideas status=candidate |
| `estimate_build` | days, plan, narrow | ideas build fields |
| `score` | все скоры | ideas scores + score_breakdown |
| `filter` | статусы | recommended/narrowed/excluded |
| `finish` | закрыть run | pipeline_runs, researches.status, last_pipeline_finished_at |

**Ретай:** ограниченные retries на сетевые/LLM 5xx; на validation error — fail без бесконечного цикла.  
**Идемпотентность:** повторный analyze создаёт новый `pipeline_run`; candidate/excluded прошлого run удаляются перед новым прогоном (recommended — перезапись с предупреждением в UI).  
**Защита от дублей:** если run уже `queued`/`running` для research — не ставить второй (кроме явного manual после cancel — post-MVP).

## Job: `research.schedule_refresh` (cron)

**Расписание:** ежедневно (например 03:00 UTC) — не каждую минуту.  
**Действие:** найти Research где `auto_refresh_enabled = true` AND `last_pipeline_finished_at` старше 3 календарных дней AND нет активного run → enqueue `pipeline.run` с `trigger=scheduled`.  
**Не делает:** глобальный краулинг вне system feed Research (MVP: один platform feed).

## Job: `signals.ingest_adapter`

**Триггер:** перед pipeline (scheduled/manual) или кнопка «Подтянуть из источника» отдельно.  
**Действие:** один адаптер → insert **новые** signals (дедуп по source_url/hash).

## Job: `idea.rescore`

**Триггер:** пользователь изменил поля сужения (`PATCH …/narrowing` + `POST …/rescore`).  
**Действие (MVP light, без LLM):**  
1. Days уже обновлены на PATCH эвристикой (−2 дня / excluded feature, baseline = current + 2×prev).  
2. Пересчёт TimeFit → Opportunity из сохранённых OneJob/AI/FirstSale.  
3. `applyRecommendedFilter` для **одной** idea (статус/exclusionReasons).  

Inngest: `idea/rescore` / function id `idea-rescore`. POST выполняет sync и зеркалит event.

## Что не делаем в фоне (MVP)

- глобальный краулинг «всех ниш интернета» вне system feed;
- рассылки;
- автодеплой чужих продуктов;
- интервал обновления ≠ 3 дня (в MVP фиксированно 3 дня, без настройки пользователем);
- LLM на `idea.rescore` (только heuristic days + pure F4).
