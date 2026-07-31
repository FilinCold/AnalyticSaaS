# Подшаг F6-02b — One Job + скоры UI

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md) · **После:** a-api-detail

## Цель

Секции: заголовок, one-job template + 6 attrs, score badges.

## Что сделать

1. `app/.../ideas/[ideaId]/page.tsx` — server fetch
2. Components: `OneJobSection`, `ScoresSection`
3. Visual: progress bars or numeric badges for 4 main scores + opportunity
4. Optional collapsible `scoreBreakdown` JSON

## DoD

- [x] All Часть 2 fields visible for recommended fixture

## Журнал

- `2026-07-31` — page SSR + `IdeaCardHeader` / `OneJobSection` / `ScoresSection`; **DONE**.
