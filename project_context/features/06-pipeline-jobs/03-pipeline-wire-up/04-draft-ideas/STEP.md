# Подшаг F5-03.4 — Draft ideas

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md) · **После:** 03-extract-cluster

## Цель

LLM `draft_ideas` + optional `draft_sales_block`; insert Idea rows `status=candidate`.

## Что сделать

1. LLM draft per cluster batch (or one call — document choice)
2. Map to Idea prisma create: product attrs + oneJobTemplate
3. Link `supportingClusterIds`, `supportingSignalIds`
4. Sales block fields if separate LLM call

## DoD

- [x] ≥1 candidate idea on fixtures
- [x] oneJobTemplate non-empty for valid drafts

## Журнал

- `2026-07-31` — one `draft_ideas` call for all clusters + per-idea `sales-block` fixture.
