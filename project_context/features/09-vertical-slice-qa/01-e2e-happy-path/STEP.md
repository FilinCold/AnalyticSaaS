# Шаг F8-01 — E2E happy path

**Статус:** DONE  
**Слой:** QA  
**Зависит от:** F1–F7 (все фичи 02–08)  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F8-01) · **Фича:** `09-vertical-slice-qa`

## Перед началом

1. `docs/ACCEPTANCE_CRITERIA.md` § «Ручной happy path»
2. `docs/USER_FLOWS.md` Flow A
3. `docs/MVP_SCOPE.md` § E2E
4. Mock LLM fixtures from F5-02

## Цель

Playwright автоматизирует Flow A на mock LLM; **без** cron (Flow A2 — отдельный test optional).

## Не входит

- Load testing
- Production LLM calls in CI
- Flow A2 scheduled (можно один unit test в F5-06)

## Подзадачи

### 1. E2E infrastructure

- `playwright.config.ts`
- `npm run test:e2e`
- Test DB: separate DATABASE_URL or truncate helpers
- Seed: test user credentials in env `E2E_USER_EMAIL/PASSWORD`

### 2. Mock LLM in e2e

- `LLM_PROVIDER=mock` + fixture `draft-ideas-recommended.json`
- Deterministic pipeline output

### 3. Test script `e2e/flow-a.spec.ts`

Steps (после UX pivot — system feed, не create Research):
1. Register (unique email или `E2E_USER_*`)
2. `/ideas` → **Обновить ленту** (mock adapters ≥3 signals)
3. Wait for pipeline succeeded (poll `GET /api/ideas` stats, timeout 90s)
4. Assert ≥1 recommended OR excluded tab
5. Open first idea card — problem, One Job, Opportunity, «Когда продолжать»
6. (Optional) narrowing rescore — не в T1

### 4. CI note

- Document: e2e may run only locally if no CI DB; or use GitHub Actions service container

### 5. Flake control

- `test.setTimeout(120000)` for pipeline step
- Retry 1 on CI optional
- `resetSystemFeed` before run; Inngest sync delay; analyze fallback

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | Full flow-a.spec | ✅ green |
| T2 | No LLM key in client bundle | ✅ vitest `LLM client bundle` |
| T3 | ACCEPTANCE_CRITERIA manual path | ✅ covered (без cron) |

## Критерии готовности (DoD)

- [x] `npm run test:e2e` green locally
- [x] T1–T3
- [x] README e2e section

## Как проверить

```bash
LLM_PROVIDER=mock npm run test:e2e
```

## Журнал

- `2026-07-31` — Playwright + `e2e/flow-a.spec.ts` (Flow A / system feed); reset helper; webServers Next+Inngest; T2 vitest bundle guard; README CI note; **169** unit + e2e green.
