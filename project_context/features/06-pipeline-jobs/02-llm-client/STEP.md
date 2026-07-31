# Шаг F5-02 — LLM client + JSON schemas

**Статус:** DONE  
**Слой:** Backend  
**Зависит от:** `01-bootstrap/01-app-scaffold`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F5-02) · **Фича:** `06-pipeline-jobs`

## Перед началом

1. `docs/LLM_CONTRACT.md`
2. `docs/AI_PIPELINE.md` § LLM usage
3. `docs/OPEN_QUESTIONS.md` (LLM provider) — закрыто: OpenAI `gpt-4o-mini`

## Цель

Обёртка LLM с structured output; Zod/JSON schemas; MockProvider для тестов.

## Не входит

- Промпты production-quality (достаточно baseline)
- Pipeline orchestration (F5-03)
- Реальные API keys в CI

## Подзадачи

### 1. Provider abstraction

```typescript
interface LlmProvider {
  completeStructured<T>(opts: { schema: ZodSchema<T>; system: string; user: string }): Promise<T>;
}
```

### 2. Implementations

- `OpenAiProvider` — OpenAI-compatible structured output (`baseURL` для OpenRouter)
- `MockLlmProvider` — reads fixtures from `fixtures/llm/`
- Factory: `createLlmProvider()` from env `LLM_PROVIDER=mock|openai|openrouter|anthropic` (anthropic throws; **рекомендуется openrouter**)

### 3. Schemas (Zod)

Per `LLM_CONTRACT.md`:
- `ExtractPainsResult`
- `ClusterPainsResult`
- `DraftIdeasResult`
- `EstimateBuildResult`
- `ScoreBreakdownResult` (full OneJob/AI/FirstSale criteria)
- `SalesBlockResult`

### 4. Env

- `.env.example`: `LLM_API_KEY`, `LLM_MODEL`, `LLM_PROVIDER`
- Never import in client components

### 5. Tests

- Mock returns fixture → parses valid
- Invalid JSON from mock → throws retriable error

## Файлы

- `AnalyticProject/src/lib/llm/`
- `AnalyticProject/fixtures/llm/*.json`

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | Mock extract pains | valid schema |
| T2 | Schema reject bad shape / invalid JSON | `LlmRetriableError` |
| T3 | Bundle check: no LLM_KEY in client | documented in README |

## Блокеры

- [x] LLM provider choice — OpenAI `gpt-4o-mini` (`DECISIONS.md` / `OPEN_QUESTIONS.md`)

## Критерии готовности (DoD)

- [x] T1–T2 green
- [x] All schemas from LLM_CONTRACT exist
- [x] T3 documented in README

## Как проверить

```bash
LLM_PROVIDER=mock npm test -- -t llm
```

## Журнал

- `2026-07-31` — Mock + OpenAI provider, Zod schemas, fixtures, tests T1–T2; T3 в README; **F5-02 DONE**.
- `2026-07-31` — OpenRouter gateway: `LLM_PROVIDER=openrouter` + `LLM_BASE_URL`; DECISIONS/README.
