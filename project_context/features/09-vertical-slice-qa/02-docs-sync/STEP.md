# Шаг F8-02 — Docs sync + freeze MVP

**Статус:** TODO  
**Слой:** Docs  
**Зависит от:** `09-vertical-slice-qa/01-e2e-happy-path`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F8-02) · **Фича:** `09-vertical-slice-qa`

## Перед началом

1. `project_context/04_STATE.md`
2. `docs/OPEN_QUESTIONS.md`
3. `docs/ACCEPTANCE_CRITERIA.md` (full MVP checklist)

## Цель

Документация синхронизирована с реализацией; STATE = MVP DONE pending owner; resolved OPEN_QUESTIONS перенесены.

## Не входит

- Post-MVP features
- Marketing docs

## Подзадачи

### 1. Update `04_STATE.md`

- Phase: реализация DONE pending owner review
- Board: R4 DONE, 01–09 DONE
- Journal entry with date

### 2. Close OPEN_QUESTIONS resolved during impl

- Auth choice, runner, LLM, adapter, hosting → DECISIONS with date
- Mark `[x]` in OPEN_QUESTIONS

### 3. Verify docs match code

- `API.md` — any path changes
- `DATABASE.md` — schema drift
- `IDEA_CARD_SPEC.md` — field renames
- `LLM_CONTRACT.md` — schema versions

### 4. MVP acceptance checklist

- Walk `ACCEPTANCE_CRITERIA.md` § MVP vertical slice — all boxes checkable true
- Note any conscious deferrals (must be none for MVP)

### 5. Owner handoff note

- README root: how to run full stack
- Known limitations list

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | Manual doc review | no contradictions API↔code |
| T2 | OPEN_QUESTIONS MVP blockers | all closed or explicitly deferred with owner OK |

## Критерии готовности (DoD)

- [ ] `04_STATE` = MVP DONE pending owner
- [ ] T1–T2
- [ ] No scope creep items added without NON_GOALS update

## Как проверить

```bash
# manual review
grep -r "TODO" docs/ project_context/features/ | head
```

## Журнал

- _(пусто)_
