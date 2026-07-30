# Шаг F3-01 — Signal + manual create

**Статус:** TODO  
**Слой:** Full stack  
**Зависит от:** `03-research/01-model-crud`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F3-01) · **Фича:** `04-signals`

## Перед началом

1. `docs/ROADMAP.md` (F3-01)
2. `docs/DATABASE.md` (`signals`)
3. `docs/DOMAIN_MODEL.md` (Signal)
4. `docs/API.md` § Signals
5. `docs/DECISIONS.md` (≥1 автозапуск / ≥3 demo)

## Цель

Ручной сигнал сохраняется в **system feed** Research (E2E/admin/secondary UI); list API; лимит длины текста.  
Не primary user flow после pivot 2026-07-30 — основной путь сигналов = адаптеры (F3-02).

## Не входит

- Source adapter (F3-02)
- Auto pipeline trigger (F5-05) — но подготовить hook point
- Normalize LLM (F5 pipeline)

## Подзадачи

### 1. Prisma Signal model

Поля по `DATABASE.md`: `sourceType` default `manual`, `rawText`, `capturedAt`, `metadata` default `{}`.

Migrate: `add_signals`

### 2. API

- `GET /api/researches/[id]/signals` — ownership via research
- `POST /api/researches/[id]/signals` — body `{ rawText }`
  - Validation: 1–50000 chars
  - Server sets `sourceType=manual`, `capturedAt=now()`

### 3. UI на research detail

- Секция «Сигналы»: textarea + «Добавить»
- List ниже: preview первых 200 символов, дата
- Counter: «N сигналов» (подсказка: «для демо рекомендуется ≥3»)

### 4. Hook placeholder для F5-05

- После successful POST: вызов `maybeTriggerInitialPipeline(researchId)` — пока no-op или TODO log

### 5. Tests

- create, list, ownership, max length 400

## Файлы

- `AnalyticProject/prisma/schema.prisma`
- `AnalyticProject/src/app/api/researches/[researchId]/signals/route.ts`
- `AnalyticProject/src/components/signals/ManualSignalForm.tsx`

## API / схема / поля

`docs/API.md` § Signals.

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | POST valid signal | 201, sourceType=manual |
| T2 | POST empty rawText | 400 |
| T3 | POST >50000 chars | 400 |
| T4 | GET list 3 signals | 3 items |
| T5 | POST to чужой research | 404 |
| T6 | Manual: add ≥3 signals | UI shows 3+ |

## Блокеры

Нет.

## Критерии готовности (DoD)

- [ ] T1–T6
- [ ] `maybeTriggerInitialPipeline` stub/export готов для F5-05

## Как проверить

```bash
npm test -- --grep signal
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F3-02.

## Журнал

- _(пусто)_
