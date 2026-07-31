# Подшаг F5-03.5 — Estimate build + narrow

**Статус:** DONE  
**Родитель:** [../STEP.md](../STEP.md) · **После:** 04-draft-ideas

## Цель

LLM `estimate_build`; apply F4-02 narrowing; update build fields.

## Что сделать

1. Per candidate idea: LLM `EstimateBuildResult`
2. If days>14: call `narrowingHelper` with secondary features from LLM
3. Update: estimatedBuildDays, buildTimeConfidence, fourteenDayBuildPlan, featuresExcludedToFitDeadline, riskOfDeveloperHelp, requiredIntegrations, mainTechnicalRisk
4. Set preliminary status hint: narrowed vs candidate

## DoD

- [x] Build fields populated on fixture idea
- [x] days>14 fixture triggers narrow or exclude per F4-02

## Журнал

- `2026-07-31` — estimate-build fixture (10d); over14 fixture + `applyNarrowing` path wired.
