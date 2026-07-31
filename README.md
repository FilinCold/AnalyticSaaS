# AnalyticSaaS

AI-система поиска коммерчески проверяемых идей micro-SaaS для соло-создателя (+ AI coding agent).

**Статус:** MVP vertical slice реализован (F0–F8) — **pending owner review**.  
Код: [`AnalyticProject/`](./AnalyticProject/). SSOT: [`docs/`](./docs/). Прогресс: [`project_context/04_STATE.md`](./project_context/04_STATE.md).

## Quick start (full stack)

```bash
# 1. Postgres 16+ (Docker или brew)
cd AnalyticProject
docker compose up -d   # или свой DATABASE_URL

# 2. Env + migrate
cp .env.example .env.local
# задать AUTH_SECRET=… и DATABASE_URL=…
npx prisma migrate deploy && npx prisma generate

# 3. Два терминала
npm run dev            # http://localhost:3010  (INNGEST_DEV=1)
npm run inngest:dev    # http://localhost:8288

# 4. Открыть http://localhost:3010/register → лента /ideas
```

Mock по умолчанию: `LLM_PROVIDER=mock`, `ADAPTER_MODE=mock` (без API keys).

### Проверки

```bash
cd AnalyticProject
curl -s http://localhost:3010/api/health   # {"ok":true}
npm run lint && LLM_PROVIDER=mock npm test && npm run build
LLM_PROVIDER=mock ADAPTER_MODE=mock npm run test:e2e
```

Подробнее: [`AnalyticProject/README.md`](./AnalyticProject/README.md). Owner checklist: `project_context/04_STATE.md` § «Как проверить».

## Документация

| Документ | Содержание |
|---|---|
| [`docs/VISION.md`](./docs/VISION.md) | Зачем продукт |
| [`docs/MVP_SCOPE.md`](./docs/MVP_SCOPE.md) | Scope / non-goals |
| [`docs/ACCEPTANCE_CRITERIA.md`](./docs/ACCEPTANCE_CRITERIA.md) | Приёмка MVP |
| [`docs/API.md`](./docs/API.md) | REST |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Стек и слои |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md) | ADR |
| [`docs/OPEN_QUESTIONS.md`](./docs/OPEN_QUESTIONS.md) | Post-MVP вопросы |

## Known limitations (MVP)

- **Hosting:** целевой Vercel + Neon зафиксирован, production deploy **не** входит в vertical slice.
- **Live LLM:** нужен `LLM_PROVIDER=openrouter` + баланс; ChatGPT Plus ≠ API.
- **Live adapters:** PH/Reddit требуют env keys; без них — errors в ingest, HN работает без ключа.
- **Inngest:** без `npm run inngest:dev` analyze/ingest→pipeline → 502.
- **Ideas API:** только `GET /api/ideas` (system feed); list идей по research id нет.
- **Rescore:** heuristic days + pure F4, без LLM.
- **Cron E2E:** Flow A2 (scheduled) — ручная/dev проверка, не в Playwright Flow A.
- **UI Research:** secondary; секция «Идеи» на detail — плейсхолдер (лента primary на `/ideas`).

## Post-MVP

См. [`docs/NON_GOALS.md`](./docs/NON_GOALS.md) и [`docs/OPEN_QUESTIONS.md`](./docs/OPEN_QUESTIONS.md) § «можно после MVP».
