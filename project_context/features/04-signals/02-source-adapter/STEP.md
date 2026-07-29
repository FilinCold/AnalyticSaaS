# Шаг F3-02 — Один source adapter

**Статус:** TODO  
**Слой:** Full stack  
**Зависит от:** `01-manual-signal`, `01-bootstrap/03-job-runner-skeleton`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F3-02) · **Фича:** `04-signals`

## Перед началом

1. `docs/ROADMAP.md` (F3-02)
2. `docs/ARCHITECTURE.md` § Adapters
3. `docs/BACKGROUND_JOBS.md` (`signals.ingest_adapter`)
4. `docs/DECISIONS.md` (`source_type` values)

## Цель

Один автоматический источник сигналов; кнопка «Подтянуть»; дедуп; mock для тестов.

## Не входит

- Второй адаптер
- UI настройки API keys (env server-side)
- Краулинг вне Research context

## Подзадачи

### 1. Выбор адаптера (OPEN_QUESTIONS)

Зафиксировать один: **Reddit search**, **Hacker News Algolia**, или **RSS feed**.  
Записать в журнал + `DECISIONS.md`.

### 2. Interface

```typescript
// src/adapters/types.ts
export interface SourceAdapter {
  readonly sourceType: 'reddit' | 'hackernews' | 'rss';
  fetchSignals(ctx: { topic: string; keywords: string[] }): Promise<IngestSignal[]>;
}
export type IngestSignal = { sourceUrl?: string; rawText: string; authorHint?: string; capturedAt: Date; metadata?: object };
```

### 3. Реализация + MockAdapter

- `src/adapters/<name>.ts` — real fetch с rate limit
- `src/adapters/mock.ts` — returns N fixture signals
- Env: `ADAPTER_MODE=mock|live`

### 4. Ingest service

- `ingestAdapterSignals(researchId)`:
  - load research topic/keywords
  - fetch from adapter
  - dedup by `sourceUrl` or hash(rawText) per research
  - insert new Signal rows

### 5. API + UI

- `POST /api/researches/[id]/signals/ingest` → sync или 202 + job
- UI: кнопка «Подтянуть из [источник]» на research detail
- Loading state + count ingested

### 6. Optional job `signals.ingest_adapter`

Если async — enqueue via F0-03 runner; иначе sync OK для MVP.

### 7. Tests

- MockAdapter → N new signals
- Second ingest → 0 duplicates

## Файлы

- `AnalyticProject/src/adapters/`
- `AnalyticProject/src/domain/signals/ingest.ts`
- `AnalyticProject/src/app/api/researches/[researchId]/signals/ingest/route.ts`

## API / схема / поля

`docs/API.md` § `POST .../signals/ingest`

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | Ingest mock | N signals, correct sourceType |
| T2 | Re-ingest | 0 new (dedup) |
| T3 | Ingest чужой research | 404 |
| T4 | Live mode без API key | graceful error message |
| T5 | UI button works | count increases |

## Блокеры (OPEN_QUESTIONS)

- [ ] Какой адаптер MVP + ToS/API keys

## Критерии готовности (DoD)

- [ ] Адаптер выбран и задокументирован
- [ ] T1–T5
- [ ] Секреты только в env

## Как проверить

```bash
ADAPTER_MODE=mock npm test -- --grep adapter
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F4-01.

## Журнал

- _(пусто)_
