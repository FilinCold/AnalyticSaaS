# Шаг F0-01 — Каркас приложения

**Статус:** DONE  
**Слой:** Backend + DevEx  
**Зависит от:** —  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F0-01) · **Фича:** `01-bootstrap`

**Подшаги (выполнять по порядку):**

| # | Папка | Что |
|---|---|---|
| a | [a-next-init](./a-next-init/STEP.md) | Next.js App Router + TS в `AnalyticProject/` |
| b | [b-tooling](./b-tooling/STEP.md) | ESLint, Prettier, test runner, smoke |
| c | [c-smoke-readme](./c-smoke-readme/STEP.md) | Placeholder UI, README, health check |

## Перед началом

1. `docs/ROADMAP.md` (F0-01)
2. `docs/ARCHITECTURE.md` (стек)
3. `docs/MVP_SCOPE.md`, `docs/DECISIONS.md`

## Цель

Рабочий Next.js+TypeScript проект в `AnalyticProject/` с lint/test, placeholder home и документированными командами — без auth, БД и продуктового UI.

## Не входит

- Prisma, PostgreSQL (F0-02)
- Job runner (F0-03)
- Auth, Research, любой доменный код
- Деплой на production
- Docker (опционально post-MVP)

## Подзадачи

См. подшаги a → b → c. Родительский шаг завершён, когда все три `DONE`.

## API / схема / поля

- `GET /api/health` → `{ "ok": true }` (см. `docs/API.md`) — создаётся в подшаге c.

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | `npm test` | exit 0, ≥1 smoke test |
| T2 | `npm run lint` | exit 0 |
| T3 | `npm run build` | exit 0 |
| T4 | `npm run dev` + открыть `/` | placeholder home рендерится |
| T5 | `GET /api/health` | 200 `{ ok: true }` |

## Блокеры (OPEN_QUESTIONS)

Нет — шаг можно начинать без закрытия OPEN_QUESTIONS.

## Критерии готовности (DoD)

- [x] Подшаги a, b, c — статус `DONE`
- [x] `AnalyticProject/README.md` описывает install/dev/test/build/lint
- [x] Все тест-кейсы T1–T5 проходят

## Как проверить

```bash
cd AnalyticProject
npm ci
npm run lint && npm test && npm run build
npm run dev
# в другом терминале:
curl -s http://localhost:3010/api/health
```

## Как отметить выполнение

1. Журнал в каждом подшаге + здесь.  
2. Статус → `DONE`.  
3. `project_context/04_STATE.md` → следующий шаг F0-02.

## Журнал

- `2026-07-29` — F0-01a–c завершены: Next.js scaffold, lint/test tooling, placeholder UI + health + README; T1–T5 OK.
