# OPEN_QUESTIONS — открытые вопросы

> Закрытые помечаются `[x]` с датой. Не дублировать в других файлах.

## Открытые (нужно до/во время реализации)

_(пусто — блокеры MVP закрыты; UX pivot `2026-07-30` зафиксирован в `DECISIONS.md`)_

## Открытые (можно после MVP)

- [ ] **Какие именно форумы** четвёртым+ адаптером (после HN / Product Hunt / Reddit).
- [ ] Биллинг AnalyticSaaS (не планируется для solo-MVP).
- [ ] Настройка интервала автообновления пользователем (в MVP фиксировано 3 дня; UX-окно 3–5).
- [ ] Персональные фильтры ленты по нише/тегам.
- [ ] Закладки / «мои идеи» per-user поверх общего каталога.

## Противоречия

_(активных нет)_

## Закрытые

- [x] `2026-07-29` — **Auth:** Auth.js + email/password (solo user).
- [x] `2026-07-29` — **Job runner:** Inngest.
- [x] `2026-07-29` — **LLM:** OpenAI `gpt-4o-mini`.
- [x] `2026-07-29` — **Source adapters:** HN + Product Hunt + Reddit в MVP; форумы — post-MVP.
- [x] `2026-07-29` — **Hosting:** Vercel + Neon.
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

Закрытые коллизии: порог сигналов, vertical slice vs cron, `succeeded`, rate limit, UI `narrowed`, go/kill, `source_type`, `PipelineRun.trigger`, LLM vs F4 scoring.
