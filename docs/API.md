# API — контракт REST MVP

> Реализация: Next.js Route Handlers в `AnalyticProject/src/app/api/`.  
> Все пути относительны к origin приложения.  
> Auth: Auth.js Credentials + JWT session cookie. Аноним → `401` на защищённых API / redirect login на страницах.

## Общие правила

| Правило | Значение |
|---|---|
| Content-Type | `application/json` |
| ID | UUID v4 в path |
| Ошибки | `{ "error": string, "code"?: string, "hint"?: string }` |
| Ownership | **Pivot 2026-07-30:** Ideas лента — общий каталог для любого auth user. Research/Signal/Run: system feed (internal) или ownership `userId` на secondary CRUD; чужой user research → `404` |
| Пагинация | MVP: без пагинации; feed list возвращает все recommended (лимит позже) |

### Коды HTTP

| Код | Когда |
|---|---|
| 200 | Успешный GET/PATCH/POST (ingest, rescore) |
| 201 | Успешный POST create |
| 202 | Analyze принят в очередь |
| 400 | Валидация тела/query |
| 401 | Нет сессии |
| 404 | Ресурс не найден или не принадлежит пользователю |
| 409 | Конфликт: duplicate pipeline run, cooldown manual analyze, rescore during active run |
| 422 | Семантическая ошибка (пустой research без сигналов для analyze) |
| 502 | Очередь Inngest недоступна (локально без `inngest:dev`) |

---

## Auth (F1)

| Метод | Путь | Тело | Ответ | Шаг |
|---|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password }` | `{ user: { id, email } }` + Set-Cookie | F1-01 |
| POST | `/api/auth/login` | `{ email, password }` | session cookie | F1-01 |
| POST | `/api/auth/logout` | — | clear cookie | F1-01 |
| GET | `/api/auth/session` | — | `{ user: { id, email } }` \| `401` | F1-01 |
| GET | `/api/me` | — | `{ user: { id, email } }` \| `401` | F1-02 |

Также: `GET|POST /api/auth/[...nextauth]` (Auth.js internal).

---

## Researches (F2) — internal / secondary

> User-facing primary API — Ideas feed. Research CRUD остаётся для system feed, E2E, admin.

### `GET /api/researches`

Список исследований текущего пользователя.

**Ответ 200:**

```json
{
  "researches": [
    {
      "id": "uuid",
      "title": "string",
      "topic": "string",
      "keywords": ["string"],
      "status": "draft|running|ready|failed",
      "autoRefreshEnabled": true,
      "lastPipelineFinishedAt": "ISO8601|null",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

### `POST /api/researches`

**Тело:**

```json
{
  "title": "string (required, 1–200)",
  "topic": "string (required, 1–500)",
  "keywords": ["string"] 
}
```

**Ответ 201:** объект research (как выше). `status` = `draft`.

### `GET /api/researches/:researchId`

**Ответ 200:** один research + опционально `activePipelineRun` (см. Pipeline).

### `PATCH /api/researches/:researchId`

**Тело (partial):** `title`, `topic`, `keywords`, `autoRefreshEnabled`.

---

## Signals (F3)

### `GET /api/researches/:researchId/signals`

**Ответ 200:**

```json
{
  "signals": [
    {
      "id": "uuid",
      "sourceType": "manual|reddit|hackernews|rss",
      "sourceUrl": "string|null",
      "rawText": "string",
      "normalizedText": "string|null",
      "authorHint": "string|null",
      "capturedAt": "ISO8601",
      "metadata": {}
    }
  ]
}
```

### `POST /api/researches/:researchId/signals`

**Тело (manual):**

```json
{
  "rawText": "string (required, 1–50000)"
}
```

Сервер выставляет `sourceType=manual`, `capturedAt=now`.

### `POST /api/researches/:researchId/signals/ingest`

Запуск адаптеров для owned Research (F3-02). **Ответ 200:** `{ "ingestedCount": number, "bySource": {}, "errors": [] }`.

### `POST /api/ideas/ingest`

Primary для ленты: getOrCreate **system feed** Research → все адаптеры (HN/PH/Reddit). Auth required.

**Ответ 200:**

```json
{
  "researchId": "uuid",
  "ingestedCount": 6,
  "bySource": { "hackernews": 2, "producthunt": 2, "reddit": 2 },
  "errors": [{ "sourceType": "producthunt", "message": "…" }]
}
```

`ADAPTER_MODE=mock|live` (default mock). Live: PH/Reddit требуют env keys; без ключа — запись в `errors`, остальные адаптеры продолжают.

После успешного ingest сервер вызывает `maybeTriggerInitialPipeline` (trigger=`initial`, только если ещё не было initial run). Повторный ingest **не** запускает manual pipeline — для повторного анализа: `POST …/analyze` или UI «Обновить идеи» на research detail.

---

## Pipeline (F5)

### `POST /api/researches/:researchId/analyze`

Запуск `pipeline.run` с `trigger=manual` (или сервером с `initial`/`scheduled`).

**Тело (optional):**

```json
{ "trigger": "manual" }
```

**Ответ 202:**

```json
{
  "pipelineRun": {
    "id": "uuid",
    "status": "queued",
    "trigger": "initial|manual|scheduled",
    "createdAt": "ISO8601"
  }
}
```

**409:** уже есть run `queued`|`running` для этого research.  
**409:** manual cooldown (< 5 мин с последнего manual start).  
**422:** нет сигналов.

### `GET /api/researches/:researchId/pipeline-runs/:runId`

**Ответ 200:**

```json
{
  "id": "uuid",
  "status": "queued|running|succeeded|failed",
  "trigger": "initial|manual|scheduled",
  "currentStep": "string|null",
  "error": "string|null",
  "createdAt": "ISO8601",
  "finishedAt": "ISO8601|null"
}
```

### `GET /api/researches/:researchId/pipeline-runs/latest`

Последний run для polling UI.

---

## Ideas (F6)

> Primary UX. Auth required. Каталог платформы (system feed), не per-user isolation.

### `GET /api/ideas` (лента)

**Query:** `status=recommended|narrowed|excluded|candidate` (default `recommended`).

**Ответ 200:**

```json
{
  "ideas": [
    {
      "id": "uuid",
      "status": "recommended",
      "problem": "string",
      "oneJobTemplate": "string",
      "oneJobScore": 85,
      "aiBuildabilityScore": 80,
      "firstSalePotential": 75,
      "estimatedBuildDays": 12,
      "opportunityScore": 82,
      "exclusionReasons": [],
      "featuresExcludedToFitDeadline": []
    }
  ],
  "stats": {
    "recommendedCount": 0,
    "narrowedCount": 0,
    "excludedCount": 0,
    "lastPipelineFinishedAt": "ISO8601|null"
  }
}
```

Сортировка: `opportunityScore DESC` для `recommended`. Данные — из system feed Research.

> **Не в MVP:** `GET /api/researches/:researchId/ideas` — secondary list по research не реализован; UI ленты читает только `GET /api/ideas`.

### `GET /api/ideas/:ideaId`

Полная карточка — все поля из `docs/IDEA_CARD_SPEC.md` / `DATABASE.md` ideas.

---

## Rescore (F7)

### `PATCH /api/ideas/:ideaId/narrowing`

**Тело (subset):**

```json
{
  "featuresExcludedToFitDeadline": ["string"],
  "mainAction": "string?",
  "concreteResult": "string?"
}
```

Validation: features — array ≤20 строк (1–200 символов); optional strings ≤500.

**Эвристика дней (MVP, без LLM):** `baseline = currentDays + 2×prevExcluded.length`; `newDays = max(1, baseline − 2×nextExcluded.length)`.

**Ответ 200:** обновлённая карточка идеи (days + narrowing fields). Status не меняется — нужен POST rescore.

### `POST /api/ideas/:ideaId/rescore`

Лёгкий пересчёт одной идеи: TimeFit → Opportunity + `applyRecommendedFilter` (скоры OneJob/AI/FirstSale сохраняются). Sync 200 + карточка.

Активный `pipeline.run` (queued/running) на том же research → **409**.

Job `idea.rescore` зарегистрирован в Inngest (`idea/rescore`); POST выполняет sync и зеркалит event.
---

## Health (F0)

| Метод | Путь | Ответ |
|---|---|---|
| GET | `/api/health` | `{ "ok": true }` |

---

## Inngest + Dev-only

| Метод | Путь | Назначение |
|---|---|---|
| ALL | `/api/inngest` | Inngest serve endpoint (не вызывается из UI) |
| POST | `/api/dev/trigger-hello` | Dev: hello job (`NODE_ENV=development`) |
| POST | `/api/dev/cron/schedule-refresh` | Dev: прямой запуск schedule-refresh logic |

---

## Что не в MVP API

WebSocket статуса pipeline; export PDF; billing; orgs; публичные share links; `GET /api/researches/:id/ideas`.
