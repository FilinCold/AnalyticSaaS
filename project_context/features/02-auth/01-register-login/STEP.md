# Шаг F1-01 — Регистрация/вход

**Статус:** TODO  
**Слой:** Full stack  
**Зависит от:** `01-bootstrap/02-prisma-postgres`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F1-01) · **Фича:** `02-auth`

**Подшаги:**

| # | Папка | Что |
|---|---|---|
| a | [a-db-schema](./a-db-schema/STEP.md) | User + auth tables в Prisma |
| b | [b-auth-provider](./b-auth-provider/STEP.md) | Auth.js или Clerk |
| c | [c-login-register-ui](./c-login-register-ui/STEP.md) | Страницы + session flow |

## Перед началом

1. `docs/ROADMAP.md` (F1-01)
2. `docs/DATABASE.md` (`users`)
3. `docs/API.md` (Auth section)
4. `docs/MVP_SCOPE.md` § Аккаунт
5. F0-02 завершён

## Цель

Пользователь регистрируется и входит; сессия сохраняется в cookie; `GET /api/auth/session` возвращает user.

## Не входит

- OAuth providers (Google/GitHub)
- Magic link (если не выбран как основной — `OPEN_QUESTIONS`)
- Orgs, RBAC, email verification (post-MVP)
- Защита Research API (F1-02)

## Подзадачи

См. подшаги a → b → c.

## API / схема / поля

См. `docs/API.md` § Auth. Минимальные поля `users`:

| Column | Type |
|---|---|
| id | uuid PK |
| email | text unique |
| password_hash | text (если credentials) |
| created_at | timestamptz |

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | POST register valid email+password | 201, Set-Cookie |
| T2 | POST register duplicate email | 409 |
| T3 | POST login valid | 200, session cookie |
| T4 | POST login wrong password | 401 |
| T5 | GET session with cookie | `{ user: { id, email } }` |
| T6 | GET session without cookie | 401 |
| T7 | Manual: register in browser → redirect/logged state | Flow A шаг 1 |

## Блокеры (OPEN_QUESTIONS)

- [ ] **Auth.js vs Clerk** — выбрать до подшага b
- [ ] **Magic link vs password** — выбрать до подшага b

## Критерии готовности (DoD)

- [ ] Подшаги a, b, c — `DONE`
- [ ] T1–T7 проходят
- [ ] Пароли не логируются; hash только server-side

## Как проверить

```bash
cd AnalyticProject
npx prisma migrate deploy
npm test -- --grep auth
# manual: /register, /login
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F1-02.

## Журнал

- _(пусто)_
