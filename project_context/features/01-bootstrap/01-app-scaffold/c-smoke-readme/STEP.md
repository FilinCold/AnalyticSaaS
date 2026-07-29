# Подшаг F0-01c — Placeholder UI + README + health

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md) · **После:** b-tooling

## Цель

Placeholder home, health endpoint, README с командами для следующих шагов.

## Что сделать

1. `app/page.tsx`: заголовок «AnalyticSaaS», подзаголовок «MVP scaffold», без продуктовой логики
2. `app/api/health/route.ts`: `GET` → `Response.json({ ok: true })`
3. Unit test для health handler (опционально) или integration через `fetch` в test
4. `AnalyticProject/README.md`:
   - Prerequisites: Node 20+, npm/pnpm
   - `npm ci`, `npm run dev`, `npm test`, `npm run build`, `npm run lint`
   - Структура папок (кратко)
   - Ссылка на `docs/` в корне репо
5. `.env.example` (пустой или с комментариями для DATABASE_URL — без секретов)

## Файлы

- `AnalyticProject/src/app/page.tsx`
- `AnalyticProject/src/app/api/health/route.ts`
- `AnalyticProject/README.md`
- `AnalyticProject/.env.example`

## DoD

- [x] `/` открывается в браузере
- [x] `/api/health` → 200
- [x] README полный для нового разработчика

## Журнал

- `2026-07-29` — Placeholder home; `GET /api/health` → `{ ok: true }`; unit test `route.test.ts`; `README.md`, `.env.example`; T4–T5 OK.
