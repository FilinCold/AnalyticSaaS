# OPEN_QUESTIONS — открытые вопросы

> **F8-02 (2026-07-31):** блокеры MVP закрыты.  
> **Owner (2026-07-31):** MVP ACCEPTED («MVP ок»). Дальше — post-MVP треки ниже.

## Открытые (нужно до/во время реализации)

_(пусто)_

## Открытые (можно после MVP) — выбери следующий трек

- [ ] **Live ideas:** OpenRouter + `ADAPTER_MODE=live` (+ опц. PH/Reddit keys) — реальные идеи вместо mock.
- [ ] **Production deploy:** Vercel + Neon (+ Inngest Cloud).
- [ ] **UX:** авто-обновление таблицы после анализа без F5; понятнее статусы ленты.
- [ ] **Какие именно форумы** четвёртым+ адаптером (после HN / Product Hunt / Reddit).
- [ ] Настройка интервала автообновления пользователем (в MVP фиксировано 3 дня; UX-окно 3–5).
- [ ] Персональные фильтры ленты по нише/тегам.
- [ ] Закладки / «мои идеи» per-user поверх общего каталога.
- [ ] Биллинг AnalyticSaaS (не планируется для solo без отдельного ТЗ).

## Противоречия

_(активных нет)_

## Закрытые

- [x] `2026-07-29` — **Auth:** Auth.js + email/password (solo user); позже JWT без PrismaAdapter (`DECISIONS` § F7–F8).
- [x] `2026-07-29` — **Job runner:** Inngest.
- [x] `2026-07-29` — **LLM:** OpenAI `gpt-4o-mini`.
- [x] `2026-07-31` — **LLM gateway:** OpenRouter (pay-as-you-go) + mock; прямой OpenAI опционально (`DECISIONS.md`).
- [x] `2026-07-29` — **Source adapters:** HN + Product Hunt + Reddit в MVP; форумы — post-MVP.
- [x] `2026-07-29` — **Hosting:** Vercel + Neon (целевой; локально brew/docker).
- [x] `2026-07-29` — **Magic link:** нет, только password.
- [x] `2026-07-29` — **PDF export:** не нужен.
- [x] `2026-07-29` — Второй+ адаптер — перенесён в MVP (3 шт.); отдельный пункт «2-й адаптер post-MVP» снят.
- [x] `2026-07-29` — Назначение продукта (Часть 1).
- [x] `2026-07-29` — Критерий micro-SaaS / One Job (Часть 2).
- [x] `2026-07-29` — Профиль создателя / AI Buildability (Часть 3).
- [x] `2026-07-29` — Срок ≤14 / поля build (Часть 4).
- [x] `2026-07-29` — First Sale / подтверждение спроса (Часть 5).
- [x] `2026-07-29` — Пользователь AnalyticSaaS = профиль создателя (для MVP).
- [x] `2026-07-29` — MVP scope, non-goals, vertical slice.
- [x] `2026-07-29` — Формулы One Job / AI Buildability / First Sale / Opportunity.
- [x] `2026-07-29` — Семантика `buildTimeConfidence`, `riskOfDeveloperHelp`, формат `fourteenDayBuildPlan`.
- [x] `2026-07-29` — Триггеры pipeline: initial, manual, scheduled (3 дня).
- [x] `2026-07-30` — **UX pivot:** лента идей (news-portal), без обязательного user Research; Research = system feed (`DECISIONS.md`).
- [x] `2026-07-31` — Rescore days = heuristic без LLM; E2E = Playwright; ideas API = только `/api/ideas` (`DECISIONS` § F7–F8).

Закрытые коллизии: порог сигналов, vertical slice vs cron, `succeeded`, rate limit, UI `narrowed`, go/kill, `source_type`, `PipelineRun.trigger`, LLM vs F4 scoring.
