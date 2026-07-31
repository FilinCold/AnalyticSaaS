# Шаг F5-01 — Idea, PainCluster, PipelineRun

**Статус:** DONE  
**Слой:** Backend · Persistence  
**Зависит от:** `01-bootstrap/02-prisma-postgres`, `03-research/01-model-crud`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F5-01) · **Фича:** `06-pipeline-jobs`

## Перед началом

1. `docs/DATABASE.md` (ideas, pain_clusters, pipeline_runs)
2. `docs/DOMAIN_MODEL.md`
3. F2-01, F0-02 завершены

## Цель

Prisma models + migration; схема соответствует DATABASE.md; без бизнес-логики заполнения.

## Не входит

- Заполнение данными
- Pipeline orchestration (F5-03)
- API ideas (F6)

## Подзадачи

### 1. Models

- `PainCluster` — fields + `signalIds` Json uuid[]
- `Idea` — все columns из DATABASE.md (camelCase in Prisma)
- `PipelineRun` — `trigger` enum string, `status`, `currentStep`, `error`
- Relations: Research has many; Idea belongs to Research

### 2. Indexes

- `ideas`: `@@index([researchId, status, opportunityScore(sort: Desc)])` — partial index note in migration comment if needed
- `pipeline_runs`: `@@index([researchId, createdAt(sort: Desc)])`

### 3. Migrate

`add_pipeline_domain`

### 4. Type exports

- `src/domain/types.ts` — re-export Prisma enums / status unions

### 5. Schema validation test (optional)

- Script compares field names to checklist in DATABASE.md

## Файлы

- `AnalyticProject/prisma/schema.prisma`
- `AnalyticProject/prisma/migrations/20260731120000_add_pipeline_domain/`
- `AnalyticProject/src/domain/types.ts`
- `AnalyticProject/src/domain/pipeline-models.test.ts`

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | migrate deploy clean DB | ✅ OK |
| T2 | Create PipelineRun row in test | ✅ FK works |
| T3 | Idea jsonb fields accept arrays | ✅ OK |

## Критерии готовности (DoD)

- [x] Все поля DATABASE.md ideas present
- [x] `trigger`: initial|manual|scheduled
- [x] `status` run: queued|running|succeeded|failed
- [x] T1–T3

## Как проверить

```bash
npx prisma migrate deploy
npx prisma validate
npm test -- -t pipeline
```

## Журнал

- `2026-07-31` — Models PainCluster/Idea/PipelineRun; migrate `add_pipeline_domain`; `domain/types.ts`; T1–T3; lint/test(92)/build OK.
