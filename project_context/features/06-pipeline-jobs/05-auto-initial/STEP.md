# Шаг F5-05 — Автозапуск initial

**Статус:** TODO  
**Слой:** Full stack  
**Зависит от:** `04-api-analyze-status`, `04-signals/01-manual-signal`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F5-05) · **Фича:** `06-pipeline-jobs`

## Перед началом

1. `docs/DECISIONS.md` (≥1 signal автозапуск)
2. `docs/MVP_SCOPE.md` § триггеры
3. `docs/USER_FLOWS.md` Flow A шаг 4
4. Hook stub from F3-01

## Цель

После первого сигнала (и только если ещё не было initial run) — auto enqueue `pipeline.run` trigger=initial.

## Не входит

- Автозапуск при пустом research
- Повторный initial при каждом новом сигнале (только первый раз)

## Подзадачи

### 1. `maybeTriggerInitialPipeline(researchId)`

Логика:
1. Count signals ≥ 1
2. No existing run with trigger=initial for this research
3. No active run queued|running
4. Create run trigger=initial, enqueue job
5. Set `research.status = running`

### 2. Call sites

- After `POST` manual signal success
- After `ingest` if new signals > 0 (F3-02)

### 3. UI indicator

- Banner: «Анализ запущен автоматически» when initial run detected
- Hide after succeeded/failed

### 4. Tests

- research + 1 signal → run created trigger=initial
- 0 signals → no run
- second signal → no second initial run
- research with prior initial → no duplicate

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | First signal | initial run queued |
| T2 | Zero signals | no run |
| T3 | Second signal | no new initial |
| T4 | Flow A step 4 manual | no required click |

## Критерии готовности (DoD)

- [ ] T1–T4
- [ ] UI indicator works

## Как проверить

```bash
npm test -- --grep initial
```

## Журнал

- _(пусто)_
