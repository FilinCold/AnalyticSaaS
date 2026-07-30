# Подшаг F0-03b — Hello job

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md) · **После:** a-choose-runner

## Цель

Job `hello` с известным payload; enqueue из API или test helper; handler пишет результат в mock/log.

## Что сделать

1. Определить job `hello`:
   - **Inngest:** `inngest.createFunction({ id: 'hello' }, { event: 'app/hello' }, handler)`
   - **BullMQ:** `Queue('hello')` + worker processor
2. Payload: `{ message: string, runId?: string }`
3. Handler: вызывает `onHelloProcessed(payload)` — экспортируемая функция для тестов
4. Dev trigger: `POST /api/dev/trigger-hello` (только `NODE_ENV=development`) или test-only helper
5. Логирование: `console` или structured logger — без секретов

## Файлы

- `AnalyticProject/src/jobs/hello.ts`
- `AnalyticProject/src/app/api/dev/trigger-hello/route.ts` (dev only)

## DoD

- [x] Enqueue + process в dev вручную работает
- [x] Handler вызывается ровно 1 раз на event

## Журнал

- `2026-07-29` — `src/jobs/hello.ts`; event `app/hello`; `POST /api/dev/trigger-hello`.
