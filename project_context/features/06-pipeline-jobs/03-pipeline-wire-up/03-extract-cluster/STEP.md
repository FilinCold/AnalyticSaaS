# Подшаг F5-03.3 — Extract + cluster

**Статус:** TODO  
**Родитель:** [../STEP.md](../STEP.md) · **После:** 02-normalize-ingest

## Цель

LLM `extract_pains` + `cluster_pains`; persist `pain_clusters`.

## Что сделать

1. Build prompt context: research topic, keywords, normalized signals
2. Call LLM → `ExtractPainsResult` → validate Zod
3. Call LLM → `ClusterPainsResult`
4. Insert PainCluster rows with signalIds
5. Store intermediate metadata on run (optional debug json)

## DoD

- [ ] ≥1 cluster for fixture research
- [ ] Mock fixture path works

## Журнал

- _(пусто)_
