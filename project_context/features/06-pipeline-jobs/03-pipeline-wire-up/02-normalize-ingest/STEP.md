# Подшаг F5-03.2 — Ingest + normalize

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md) · **После:** 01-orchestrator-shell

## Цель

Steps `ingest` (optional) + `normalize`: обновить `signals.normalized_text`.

## Что сделать

1. `ingest`: if trigger scheduled|manual — call `ingestAdapterSignals` (F3-02); initial may skip
2. `normalize`: deterministic cleanup per signal:
   - trim, collapse whitespace
   - strip obvious HTML tags
   - max length cap 50000
3. Persist `normalizedText` on each signal
4. Fail if 0 signals after ingest

## DoD

- [x] normalized_text populated for all signals
- [x] 0 signals → run fails with clear error

## Журнал

- `2026-07-31` — `normalizeSignalText` + steps ingest/normalize; T2 0 signals → failed (RU message).
