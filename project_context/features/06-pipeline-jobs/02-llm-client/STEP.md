# Шаг F5-02 — LLM client + JSON schemas

**Статус:** TODO  
**Слой:** Backend  
**Зависит от:** `01-bootstrap/01-app-scaffold`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F5-02) · **Фича:** `06-pipeline-jobs`

## Перед началом

1. `docs/LLM_CONTRACT.md`
2. `docs/AI_PIPELINE.md` § LLM usage
3. `docs/OPEN_QUESTIONS.md` (LLM provider)

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

- `OpenAiProvider` or `AnthropicProvider` — one chosen
- `MockLlmProvider` — reads fixtures from `fixtures/llm/`
- Factory: `createLlmProvider()` from env `LLM_PROVIDER=mock|openai|anthropic`

### 3. Schemas (Zod)

Per `LLM_CONTRACT.md`:
- `ExtractPainsResult`
- `ClusterPainsResult`
- `DraftIdeasResult`
- `EstimateBuildResult`
- `ScoreBreakdownResult`
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
| T2 | Schema reject bad shape | throw |
| T3 | Bundle check: no LLM_KEY in client | manual/grep |

## Блокеры

- [ ] LLM provider choice — можно начать с Mock-only, live позже

## Критерии готовности (DoD)

- [ ] T1–T2 green
- [ ] All schemas from LLM_CONTRACT exist
- [ ] T3 documented in README

## Как проверить

```bash
LLM_PROVIDER=mock npm test -- --grep llm
```

## Журнал

- _(пусто)_
