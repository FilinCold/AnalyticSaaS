# Шаг F3-02 — Source adapters (HN → PH → Reddit)

**Статус:** DONE  
**Слой:** Full stack  
**Зависит от:** `01-manual-signal`, `01-bootstrap/03-job-runner-skeleton`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F3-02) · **Фича:** `04-signals`

## Перед началом

1. `docs/ROADMAP.md` (F3-02)
2. `docs/ARCHITECTURE.md` § Adapters
3. `docs/BACKGROUND_JOBS.md` (`signals.ingest_adapter`)
4. `docs/DECISIONS.md` (`source_type` values, порядок HN → PH → Reddit)

## Цель

Три авто-источника сигналов в **system feed**; кнопка «Обновить ленту» на `/ideas`; дедуп; mock для тестов.

## Не входит

- 4-й адаптер / форумы
- UI настройки API keys (env server-side)
- Async Inngest job (sync OK)
- Pipeline / идеи в ленте (F5/F6)

## Подзадачи

### 1. Выбор адаптеров

SSOT: **HN → Product Hunt → Reddit** (`DECISIONS.md` § 2026-07-29). STEP устарел («один адаптер») — supersede.

### 2. Interface

`src/adapters/types.ts` — `SourceAdapter`, `IngestSignal`, `AdapterConfigError`.

### 3. Реализация + MockAdapter

- `hackernews.ts` — Algolia, без ключа
- `producthunt.ts` — GraphQL + `PRODUCTHUNT_API_TOKEN`
- `reddit.ts` — OAuth client credentials
- `mock.ts` — N fixture signals
- `ADAPTER_MODE=mock|live` (default mock)

### 4. Ingest service

- `domain/signals/ingest.ts` — fetch → dedup (`sourceUrl` | hash rawText) → insert
- `lib/signal/system-feed.ts` — getOrCreate system Research (`topic=__system_feed__`)

### 5. API + UI

- `POST /api/ideas/ingest` — primary (лента)
- `POST /api/researches/[id]/signals/ingest` — secondary (owned research)
- UI: `RefreshFeedButton` на `/ideas`

### 6. Optional job

Не делали — sync MVP.

### 7. Tests

T1–T4 + API ownership + ideas ingest + config errors.

## Файлы

- `AnalyticProject/src/adapters/`
- `AnalyticProject/src/domain/signals/ingest.ts`
- `AnalyticProject/src/app/api/ideas/ingest/route.ts`
- `AnalyticProject/src/app/api/researches/[researchId]/signals/ingest/route.ts`
- `AnalyticProject/src/components/ideas/RefreshFeedButton.tsx`

## Тест-кейсы

| # | Сценарий | Статус |
|---|---|---|
| T1 | Ingest mock | ✅ N signals, sourceType |
| T2 | Re-ingest | ✅ 0 new (dedup) |
| T3 | Ingest чужой research | ✅ 404 |
| T4 | Live без API key | ✅ graceful error |
| T5 | UI button | ⏳ owner browser |

## Критерии готовности (DoD)

- [x] Адаптеры HN/PH/Reddit + mock
- [x] T1–T4
- [x] Секреты только в env
- [ ] T5 owner browser

## Как проверить

```bash
ADAPTER_MODE=mock npm test -- -t "ingest|adapter"
```

Браузер: `/ideas` → «Обновить ленту» → «Добавлено сигналов: N».

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F4-01.

## Журнал

- `2026-07-31` — F3-02: adapters HN/PH/Reddit + mock; system feed; `POST /api/ideas/ingest` + research ingest; UI на `/ideas`; T1–T4 green; lint/test/build OK.
