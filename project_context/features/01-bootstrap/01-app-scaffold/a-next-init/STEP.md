# Подшаг F0-01a — Next.js init

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md)

## Цель

Создать `AnalyticProject/` с Next.js App Router, TypeScript, базовой структурой папок.

## Что сделать

1. `npx create-next-app@latest` в `AnalyticProject/`:
   - TypeScript: yes
   - ESLint: yes
   - Tailwind: yes (минимальный UI для placeholder)
   - `src/` directory: по выбору (зафиксировать в журнале)
   - App Router: yes
   - import alias `@/*`: yes
2. Структура каталогов (создать пустые или с `.gitkeep`):
   - `src/app/` (или `app/`)
   - `src/lib/`
   - `src/domain/` (пусто до F4)
3. `.gitignore` включает `node_modules`, `.next`, `.env*`
4. `package.json` scripts: `dev`, `build`, `start`, `lint`

## Файлы

- `AnalyticProject/package.json`
- `AnalyticProject/tsconfig.json`
- `AnalyticProject/next.config.ts`
- `AnalyticProject/src/app/layout.tsx`
- `AnalyticProject/src/app/page.tsx`

## DoD

- [x] `npm run build` успешен
- [x] `npm run dev` стартует без ошибок

## Журнал

- `2026-07-29` — Next.js 16.2.12 + TS + Tailwind + ESLint; **`src/` directory: yes**; alias `@/*`; каталоги `src/lib/`, `src/domain/`; `npm run build` OK; dev на `:3010` (3000/3001 заняты).
