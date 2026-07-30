# Подшаг F0-03a — Выбор job runner

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md)

## Цель

Выбрать Inngest **или** BullMQ+Redis; установить зависимости; базовый конфиг в проекте.

## Что сделать

1. Прочитать `OPEN_QUESTIONS` → принять решение (владелец или журнал с обоснованием)
2. **Inngest path:**
   - `npm i inngest`
   - `src/lib/inngest/client.ts` — `new Inngest({ id: 'analyticsaas' })`
   - `src/app/api/inngest/route.ts` — serve
3. **BullMQ path:**
   - `npm i bullmq ioredis`
   - `src/lib/queue.ts` — connection from `REDIS_URL`
   - `src/workers/hello.worker.ts` — отдельный script `npm run worker`
4. `.env.example`: `INNGEST_EVENT_KEY` или `REDIS_URL`
5. README: как запустить worker/dev server

## DoD

- [x] Зависимости установлены
- [x] Решение зафиксировано в журнале родительского STEP
- [x] Dev server стартует без ошибок конфига

## Журнал

- `2026-07-29` — `inngest` ^4.13; `src/lib/inngest/client.ts`; `src/app/api/inngest/route.ts`.
