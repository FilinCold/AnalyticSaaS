# Подшаг F5-03.1 — Orchestrator shell

**Статус:** TODO  
**Родитель:** [../STEP.md](../STEP.md)

## Цель

Job `pipeline.run` registration; create/update `PipelineRun`; step runner loop.

## Что сделать

1. `src/jobs/pipeline.run.ts` — entry `{ researchId, pipelineRunId, trigger }`
2. On start: `status=running`, `currentStep=ingest`
3. `runStep(name, fn)` wrapper: update currentStep, catch → set failed
4. On success: delegate to substep 6 for finish
5. Export `executePipelineRun` for tests (direct call without queue)

## DoD

- [ ] Run row transitions queued→running
- [ ] Failed step sets status=failed

## Журнал

- _(пусто)_
