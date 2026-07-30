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

**Фича:** F2-03 DONE (Ideas feed home) → следующий **F3-01 Signal model**  
**Статус:** [`project_context/04_STATE.md`](04_STATE.md)  
→ Открой STATE, возьми первый `TODO`. STEP: `features/04-signals/01-manual-signal/STEP.md`.  
**Pivot:** лента идей, не create Research — `docs/DECISIONS.md` § 2026-07-30.

## 🔒 Правила

- План → согласование → код. Без одобрения не реализовывать.
- Не расширять scope за `docs/MVP_SCOPE.md` / `docs/NON_GOALS.md`.
- Один факт — один файл. Прогресс — `04_STATE.md` + README фичи + `STEP.md`.
