# ARCHITECTURE — AnalyticSaaS MVP

## Обзор

Монолитное web-приложение с фоновыми job для AI-pipeline. Один продукт, один основной flow.

```
[Browser UI]
     │
[Next.js App Router — API + SSR]
     │
[Domain services: Research / Signal / Idea / Scoring]
     │
[PostgreSQL via Prisma]     [Job runner] ──► [LLM provider]
```

## Предлагаемый стек (зафиксирован, см. DECISIONS)

| Слой | Выбор | Почему |
|---|---|---|
| App | Next.js (App Router) + TypeScript | один репо, UI+API, удобно для AI-агента |
| DB | PostgreSQL + Prisma | типичные схемы, миграции, managed (Neon) |
| Auth | **Auth.js** + email/password (JWT, без PrismaAdapter) | solo user |
| Jobs | **Inngest** | Vercel, cron, без Redis |
| LLM | **OpenRouter** → `openai/gpt-4o-mini` (или прямой OpenAI); mock в тестах | pay-as-you-go |
| Hosting | **Vercel** + **Neon** Postgres (целевой; локально brew/docker) | простой деплой |
| Adapters | HN + Product Hunt + Reddit + manual | см. `DECISIONS.md` |
| E2E | Playwright | Flow A на mock LLM |

## Слои

1. **UI** — Ideas feed (primary) + idea card; Research list/detail (secondary); Pipeline status / banners.
2. **API** — REST/Route Handlers: ideas feed/ingest/card/rescore, research/signals CRUD, analyze/pipeline-runs.
3. **Domain** — чистые функции скоринга + оркестрация pipeline (без UI).
4. **Adapters** — `SourceAdapter` ×3 (HN/PH/Reddit) + mock + manual paste.
5. **Jobs** — `pipeline.run`, `schedule-refresh`, `idea.rescore`, hello.
6. **Persistence** — Prisma models (`DATABASE.md`).

## Границы

- LLM вызывается **только** из job/domain scoring, не из произвольного UI-чата.
- Исходники сигналов хранятся; идеи ссылаются на supporting signal ids.
- Нет отдельного microservice mesh в MVP.

## Безопасность (минимум)

- Auth на все мутации.
- Секреты LLM/API только server-side.
- Rate limit на start pipeline: блокировка дубля run + не более 1 manual start за 5 мин на Research (per user). Полный лимит по всем Research — post-MVP.
- Не логировать полные API keys.

## Масштабирование

MVP рассчитан на низкую нагрузку. Горизонтальный scraping cluster — non-goal.
