# Подшаг F0-03c — Integration tests

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md) · **После:** b-hello-job

## Цель

Автотест: hello job executed; README для локального запуска jobs.

## Что сделать

1. Test `hello.job.test.ts`:
   - mock/spy на `onHelloProcessed`
   - вызвать handler напрямую **или** in-process queue (без реального Redis если BullMQ — use ioredis-mock)
2. README секция «Background jobs»:
   - как запустить Inngest dev / worker
   - env vars
3. Убедиться `npm test` включает job tests

## DoD

- [x] `npm test -- -t job` green
- [x] README обновлён

## Журнал

- `2026-07-29` — `hello.job.test.ts`; README «Background jobs»; `npm run inngest:dev`.
