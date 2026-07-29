# Шаг F0-03 — Job runner skeleton

**Статус:** TODO  
**Слой:** Backend · Jobs  
**Зависит от:** `01-app-scaffold` (параллельно с F0-02 допустимо)  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F0-03) · **Фича:** `01-bootstrap`

**Подшаги:**

| # | Папка | Что |
|---|---|---|
| a | [a-choose-runner](./a-choose-runner/STEP.md) | Выбор и конфиг Inngest или BullMQ |
| b | [b-hello-job](./b-hello-job/STEP.md) | Hello job enqueue + process |
| c | [c-integration-tests](./c-integration-tests/STEP.md) | Тесты и dev-инструкция |

## Перед началом

1. `docs/ROADMAP.md` (F0-03)
2. `docs/BACKGROUND_JOBS.md` (обзор job-ов — реализация позже)
3. `docs/OPEN_QUESTIONS.md` (Inngest vs BullMQ)
4. F0-01 завершён

## Цель

Подключён job runner; hello-job ставится в очередь и выполняется локально; есть integration test.

## Не входит

- `pipeline.run`, `idea.rescore`, cron (F5, F7)
- LLM вызовы
- Production Redis/Inngest Cloud настройка (достаточно dev mode)

## Подзадачи

См. подшаги a → b → c.

## API / схема / поля

**Inngest:** `POST /api/inngest` (serve handler).  
**BullMQ:** worker process + Redis queue `hello`.

Детали — в подшаге a после выбора runner.

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | Enqueue hello job | job принят runner |
| T2 | Process hello | side effect (log/mock fn called) |
| T3 | `npm test -- --grep job` | integration green |
| T4 | Dev: дважды enqueue | оба обработаны (или dedup документирован) |

## Блокеры (OPEN_QUESTIONS)

- [ ] **Inngest vs BullMQ+Redis** — выбрать до подшага a; зафиксировать в `DECISIONS.md` + журнал.

Рекомендация для соло+Vercel: **Inngest** (меньше инфра). Для self-hosted: BullMQ.

## Критерии готовности (DoD)

- [ ] Подшаги a, b, c — `DONE`
- [ ] Решение runner записано в журнал / DECISIONS
- [ ] Hello job локально отрабатывает
- [ ] T1–T3 green

## Как проверить

```bash
cd AnalyticProject
npm test -- --grep job
# + ручной dev по README подшага c
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F1-01.

## Журнал

- _(пусто)_
