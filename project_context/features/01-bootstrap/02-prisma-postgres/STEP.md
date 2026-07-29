# Шаг F0-02 — Prisma + Postgres

**Статус:** TODO  
**Слой:** Backend · Persistence  
**Зависит от:** `01-app-scaffold`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F0-02) · **Фича:** `01-bootstrap`

## Перед началом

1. `docs/ROADMAP.md` (F0-02)
2. `docs/DATABASE.md` (обзор — доменные таблицы **позже**)
3. `docs/ARCHITECTURE.md` (PostgreSQL + Prisma)
4. F0-01 завершён (`AnalyticProject/` существует)

## Цель

Prisma подключён к PostgreSQL; baseline-миграция на пустой схеме; singleton Prisma Client; локальный `migrate deploy` работает.

## Не входит

- Таблицы `users`, `researches`, `signals`, `ideas` (F1, F2, F3, F5)
- Seed данные
- Production hosting choice (Neon/Supabase — `OPEN_QUESTIONS`, но локально Docker/pg достаточно)

## Подзадачи

### 1. Зависимости и schema

- `npm i prisma @prisma/client`
- `npx prisma init`
- `datasource db`: `postgresql`, `url = env("DATABASE_URL")`
- `generator client`: `prisma-client-js`
- Schema **без** доменных моделей (только комментарий «domain models in F1+»)

### 2. Baseline migration

- `npx prisma migrate dev --name init` → `prisma/migrations/.../migration.sql`
- SQL может быть пустым или только extensions — главное reproducible migrate

### 3. Prisma Client singleton

- `src/lib/prisma.ts`:
  - `globalThis` guard для dev hot-reload
  - export `prisma` instance
- Не импортировать prisma в client components

### 4. Локальная БД и документация

- `docker-compose.yml` в `AnalyticProject/` **или** инструкция «установи Postgres локально»
- `.env.example`: `DATABASE_URL="postgresql://user:pass@localhost:5432/analyticsaas"`
- README: секция «Database setup» + `npx prisma migrate deploy`

### 5. Smoke test DB

- Test: `prisma.$queryRaw\`SELECT 1\`` в integration test (skip если нет DATABASE_URL в CI — использовать env check)

## Файлы

- `AnalyticProject/prisma/schema.prisma`
- `AnalyticProject/prisma/migrations/`
- `AnalyticProject/src/lib/prisma.ts`
- `AnalyticProject/docker-compose.yml` (опционально)
- `AnalyticProject/.env.example`

## API / схема / поля

Нет HTTP API. Schema пустая (no models).

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | Чистая БД + `npx prisma migrate deploy` | exit 0 |
| T2 | `npx prisma generate` | client сгенерирован |
| T3 | Import `prisma` в server test + `SELECT 1` | не падает (при наличии БД) |
| T4 | Повторный `migrate deploy` | idempotent, exit 0 |

## Блокеры (OPEN_QUESTIONS)

- Hosting Postgres — не блокирует локальную разработку.

## Критерии готовности (DoD)

- [ ] `prisma migrate deploy` на чистой локальной БД
- [ ] `DATABASE_URL` документирован в README и `.env.example`
- [ ] Prisma client singleton без утечек в dev
- [ ] T1–T4 проходят

## Как проверить

```bash
cd AnalyticProject
docker compose up -d   # если есть compose
cp .env.example .env   # настроить DATABASE_URL
npx prisma migrate deploy
npx prisma generate
npm test -- --grep prisma
```

## Как отметить выполнение

1. Журнал ниже. 2. Статус → `DONE`. 3. `04_STATE.md` → F0-03.

## Журнал

- _(пусто)_
