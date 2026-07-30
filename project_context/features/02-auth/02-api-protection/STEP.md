# Шаг F1-02 — Защита API

**Статус:** DONE  
**Слой:** Backend + Frontend  
**Зависит от:** `01-register-login`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F1-02) · **Фича:** `02-auth`

## Перед началом

1. `docs/ROADMAP.md` (F1-02)
2. `docs/ARCHITECTURE.md` § Безопасность
3. `docs/API.md` (общие правила 401/404)
4. F1-01 завершён

## Цель

Все мутации и приватные GET требуют сессии; аноним → 401; UI редиректит неавторизованных на `/login`.

## Не входит

- RBAC, roles
- Rate limiting auth endpoints (post-MVP)
- CSRF — полагаемся на SameSite cookies + framework defaults

## Подзадачи

### 1. Server auth helper

- `src/lib/auth/get-session.ts`: `getSessionUser()` → `{ id, email } | null`
- `requireAuth()`: throws / returns 401 Response для route handlers

### 2. Middleware

- `middleware.ts`: matcher для `/researches/*`, `/api/researches/*`, `/api/ideas/*`
- Нет сессии + page route → redirect `/login?callbackUrl=...`
- Нет сессии + API → 401 JSON

### 3. Заглушка protected route (до F2)

- `GET /api/me` → current user (для тестов F1-02)
- Или временный `POST /api/researches` stub returning 501 — **лучше** дождаться F2 и тестировать на real CRUD

### 4. UI guard

- Layout `(app)/layout.tsx`: если нет session на protected pages — redirect (дублирует middleware для SSR safety)

### 5. Tests

- `auth-guard.test.ts`: fetch `/api/me` без cookie → 401; с cookie test user → 200

## Файлы

- `AnalyticProject/src/middleware.ts`
- `AnalyticProject/src/lib/auth/get-session.ts`
- `AnalyticProject/src/app/api/me/route.ts`

## API / схема / поля

| Метод | Путь | Auth | Ответ |
|---|---|---|---|
| GET | `/api/me` | required | `{ user: { id, email } }` |

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | GET `/api/me` без cookie | 401 |
| T2 | GET `/api/me` с valid session | 200 + user |
| T3 | GET `/researches` без cookie | redirect `/login` |
| T4 | GET `/login` без cookie | 200 (публичная) |
| T5 | После F2: POST research без cookie | 401 |

## Блокеры

Нет.

## Критерии готовности (DoD)

- [x] T1–T4 green
- [ ] T5 — проверить повторно после F2-01 (добавить в журнал F2)
- [x] Middleware matcher не блокирует `/api/auth/*`, `/api/health`, static

## Как проверить

```bash
npm test -- auth-guard
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F2-01.

## Журнал

- `2026-07-29` — `getSessionUser`/`requireAuth`; edge-safe `auth.config.ts`; middleware + `protectRequest`; `GET /api/me`; `(app)` layout; login `callbackUrl`; T1–T4 green; lint/test/build OK.
