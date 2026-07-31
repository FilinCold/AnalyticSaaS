# Шаг F7-01 — Edit narrowing + rescore

**Статус:** DONE  
**Слой:** Full stack  
**Зависит от:** `07-ideas-ui/02-idea-card`, `05-scoring-domain/02-narrowing-helper`, `06-pipeline-jobs/03-pipeline-wire-up`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F7-01) · **Фича:** `08-narrow-rescore`

## Перед началом

1. `docs/USER_FLOWS.md` Flow C шаг 2
2. `docs/BACKGROUND_JOBS.md` (`idea.rescore`)
3. `docs/IDEA_CARD_SPEC.md` § Редактируемые поля
4. `docs/API.md` § Rescore

## Цель

Пользователь правит поля сужения → job `idea.rescore` → обновлённые скоры/статус (может стать recommended).

## Не входит

- Полный re-ingest / new pipeline run
- LLM suggest narrow (optional nice-to-have)
- Edit sales/build fields beyond narrowing subset

## Подзадачи

### 1. PATCH narrowing API

- `PATCH /api/ideas/[ideaId]/narrowing`
- Allowed: `featuresExcludedToFitDeadline`, `mainAction?`, `concreteResult?`
- Validation: arrays of strings, max items

### 2. Job `idea.rescore`

- Input: ideaId
- Steps: re-estimate days (light/heuristic or small LLM call — document choice)
- Re-run F4 scores + filter for **this idea only**
- Update row status/scores
- No touch other ideas

### 3. POST rescore trigger

- `POST /api/ideas/[ideaId]/rescore` — enqueue job
- Or auto-enqueue after PATCH

### 4. UI form on idea card (narrowed or recommended)

- Editable list: excluded features (add/remove chips)
- Button «Пересчитать скоры»
- Loading state; refresh card on complete
- Success toast: «Статус: recommended» or «остаётся narrowed»

### 5. Race handling

- Block rescore if pipeline.run active for same research → 409

### 6. Tests

- PATCH + rescore: narrowed → recommended when thresholds met (fixture)

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | PATCH valid narrowing | 200 |
| T2 | rescore job updates scores | |
| T3 | narrowed → recommended possible | fixture |
| T4 | rescore during pipeline | 409 |
| T5 | Flow C step 2 | manual |

## Критерии готовности (DoD)

- [x] T1–T4 (T5 owner Flow C)
- [x] Job registered in runner

## Как проверить

```bash
npm test -- --grep rescore
```

## Журнал

- `2026-07-31` — PATCH narrowing + heuristic days (−2/feature); sync POST rescore (TimeFit/Opportunity/filter); Inngest `idea-rescore`; UI NarrowingEditForm; **167** tests; T5 ⏳ owner.
