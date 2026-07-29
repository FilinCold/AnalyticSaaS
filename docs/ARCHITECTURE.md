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

## Предлагаемый стек (решение-предложение, см. DECISIONS)

| Слой | Выбор | Почему |
|---|---|---|
| App | Next.js (App Router) + TypeScript | один репо, UI+API, удобно для AI-агента |
| DB | PostgreSQL + Prisma | типичные схемы, миграции, managed (Neon/Supabase) |
| Auth | **Auth.js** + email/password | solo user, Prisma adapter |
| Jobs | **Inngest** | Vercel, cron, без Redis |
| LLM | **OpenAI** `gpt-4o-mini` | structured output, mock в тестах |
| Hosting | **Vercel** + **Neon** Postgres | простой деплой |
| Adapters | HN + Product Hunt + Reddit | см. `DECISIONS.md` |

## Слои

1. **UI** — Research list/detail, Signals, Ideas list/card, Job status.
2. **API** — REST/Route Handlers: CRUD research/signals, start pipeline, get ideas, rescore.
3. **Domain** — чистые функции скоринга + оркестрация pipeline (без UI).
4. **Adapters** — `ManualSignalAdapter`, `SourceAdapter` (один авто).
5. **Jobs** — шаги pipeline как отдельные job-step с идемпотентностью.
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
