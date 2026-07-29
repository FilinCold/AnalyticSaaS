# Шаг F2-01 — Модель Research + CRUD API

**Статус:** TODO  
**Слой:** Backend  
**Зависит от:** `02-auth/02-api-protection`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F2-01) · **Фича:** `03-research`

## Перед началом

1. `docs/ROADMAP.md` (F2-01)
2. `docs/DATABASE.md` (`researches`)
3. `docs/DOMAIN_MODEL.md` (Research)
4. `docs/API.md` § Researches
5. F1-02 завершён

## Цель

Таблица `researches`; CRUD API; пользователь видит и изменяет только свои записи.

## Не входит

- UI (F2-02)
- Signals, pipeline trigger (F3, F5)
- `status` transitions кроме default `draft`

## Подзадачи

### 1. Prisma model

```prisma
model Research {
  id                      String    @id @default(uuid())
  userId                  String    @map("user_id")
  user                    User      @relation(...)
  title                   String
  topic                   String
  keywords                String[]  // или Json
  status                  String    @default("draft")
  autoRefreshEnabled      Boolean   @default(true) @map("auto_refresh_enabled")
  lastPipelineFinishedAt  DateTime? @map("last_pipeline_finished_at")
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
  @@index([userId])
  @@map("researches")
}
```

Migrate: `add_researches`

### 2. Validation layer

- `src/lib/validation/research.ts` — zod schemas:
  - create: title 1–200, topic 1–500, keywords max 20 items
  - patch: partial

### 3. API routes

| Route | Handler |
|---|---|
| `GET /api/researches` | list by `userId` |
| `POST /api/researches` | create |
| `GET /api/researches/[id]` | get one + ownership |
| `PATCH /api/researches/[id]` | update |

Все через `requireAuth()`.

### 4. Ownership

- Query всегда `where: { id, userId: session.user.id }`
- Чужой id → 404

### 5. Tests

- `research.api.test.ts`: user A create; user B get A's id → 404; list only own

## Файлы

- `AnalyticProject/prisma/schema.prisma`
- `AnalyticProject/src/app/api/researches/route.ts`
- `AnalyticProject/src/app/api/researches/[researchId]/route.ts`
- `AnalyticProject/src/lib/validation/research.ts`

## API / схема / поля

Полный контракт: `docs/API.md` § Researches.

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | POST create valid | 201, status=draft |
| T2 | POST без title | 400 |
| T3 | GET list | только свои |
| T4 | GET чужой id | 404 |
| T5 | PATCH свой research | 200 |
| T6 | PATCH чужой | 404 |
| T7 | Аноним POST | 401 (F1-02) |

## Блокеры

Нет.

## Критерии готовности (DoD)

- [ ] Migrate deploy OK
- [ ] T1–T7 green
- [ ] Response shape соответствует API.md

## Как проверить

```bash
npx prisma migrate deploy
npm test -- --grep research
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F2-02.

## Журнал

- _(пусто)_
