# Подшаг F6-02a — API detail

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md)

## Цель

`GET /api/ideas/[ideaId]` — полный объект; ownership via research.userId.

## Что сделать

1. Route handler + auth
2. Map Prisma → API JSON (camelCase)
3. Include all fields from IDEA_CARD_SPEC
4. 404 if not owner

## DoD

- [x] Response matches fixture snapshot test

## Журнал

- `2026-07-31` — `toIdeaDetail` + `getIdeaDetail` (system feed any auth / else owner); route; contract T1–T2 + 401/404; **DONE**.
