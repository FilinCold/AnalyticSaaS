# CLAUDE.md — AnalyticSaaS

> Навигатор (сжатый). Детали прогресса — только в `04_STATE.md`.
>
> **Cursor:** `.cursor/rules/project-navigator.mdc` + `agent-core.mdc` — держать синхронными.

## Что за проект

AI-система поиска коммерчески проверяемых идей micro-SaaS (не product analytics). Для соло-создателя + AI coding agent.

## Стек и где что

| Часть | Стек | Папка |
|---|---|---|
| Код | Next.js+TS+Prisma+PG+Auth.js+Inngest | `AnalyticProject/` |
| SSOT | — | `docs/` |
| Kickoff/прогресс | — | `project_context/` |

Локально: `cd AnalyticProject && npm run dev` (порт **3010**).

## 🎯 Активный план

**MVP ACCEPTED** (`2026-07-31`, owner: «MVP ок»).  
→ Следующий трек — выбор владельца: [`docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md) § после MVP.  
**Статус:** [`project_context/04_STATE.md`](04_STATE.md)

## 🔒 Правила

- План → согласование → код. Без одобрения не реализовывать.
- Не расширять scope за `docs/MVP_SCOPE.md` / `docs/NON_GOALS.md`.
- Один факт — один файл. Прогресс — `04_STATE.md` + README фичи + `STEP.md`.
- **Сразу после DoD шага** — обновить `STEP.md` / README фичи / `04_STATE.md` / navigator. Не откладывать.
