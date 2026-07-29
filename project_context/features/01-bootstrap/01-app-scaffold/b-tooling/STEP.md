# Подшаг F0-01b — Lint и test runner

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md) · **После:** a-next-init

## Цель

Единые команды lint/test; минимум один автоматический smoke test.

## Что сделать

1. ESLint: конфиг create-next-app + при необходимости `eslint-config-prettier`
2. Prettier: `.prettierrc` (semi, singleQuote — зафиксировать)
3. Test runner: **Vitest** (рекомендация) или Jest:
   - `npm test` запускает все unit/smoke
   - `vitest.config.ts` с alias `@/`
4. Smoke test: `src/lib/smoke.test.ts` — `expect(true).toBe(true)` или проверка экспорта утилиты
5. Добавить script `"test": "vitest run"` (или jest)

## Файлы

- `AnalyticProject/vitest.config.ts`
- `AnalyticProject/src/lib/smoke.test.ts`
- `AnalyticProject/.prettierrc`

## DoD

- [x] `npm run lint` — exit 0
- [x] `npm test` — exit 0, ≥1 test passed

## Журнал

- `2026-07-29` — Vitest + Prettier + eslint-config-prettier; `vitest.config.ts` alias `@/`; smoke test `src/lib/smoke.test.ts`; `npm run lint` / `npm test` OK.
