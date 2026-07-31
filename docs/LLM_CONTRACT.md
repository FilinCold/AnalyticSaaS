# LLM_CONTRACT — structured output для pipeline

> SSOT шагов pipeline: `docs/AI_PIPELINE.md`, `docs/BACKGROUND_JOBS.md`.  
> Реализация: `AnalyticProject/src/lib/llm/` (F5-02).  
> **Правило:** LLM возвращает draft + `score_breakdown` (0/50/100). Итоговые int-скоры считает F4 (`DECISIONS.md`).

## Общие требования

| Параметр | MVP |
|---|---|
| Провайдер | **OpenRouter** (OpenAI-compatible) или прямой OpenAI; модель `openai/gpt-4o-mini` / `gpt-4o-mini` (`DECISIONS.md` § 2026-07-31) |
| Формат | JSON Schema / structured output |
| Температура | ≤ 0.3 для extract, draft, breakdown |
| Секреты | Только server-side env; не в client bundle |
| Ошибки | Invalid JSON → retry 1× → fail step |
| Mock | Обязателен для тестов (фикстуры в repo) |

## Вызовы по шагам pipeline

### 1. `extract_pains` (после normalize)

**Вход:** массив `{ signalId, normalizedText }`, контекст research `{ topic, keywords }`.

**Выход (schema `ExtractPainsResult`):**

```json
{
  "pains": [
    {
      "signalId": "uuid",
      "painStatement": "string",
      "audienceHint": "string",
      "frequencyHint": "low|medium|high",
      "evidenceQuote": "string"
    }
  ]
}
```

### 2. `cluster_pains`

**Вход:** pains из extract.

**Выход (`ClusterPainsResult`):**

```json
{
  "clusters": [
    {
      "label": "string",
      "summary": "string",
      "frequencyHint": "low|medium|high",
      "signalIds": ["uuid"]
    }
  ]
}
```

### 3. `draft_ideas`

**Вход:** clusters + research context.

**Выход (`DraftIdeasResult`):**

```json
{
  "ideas": [
    {
      "clusterIds": ["uuid"],
      "primaryUser": "string",
      "problem": "string",
      "inputDataType": "string",
      "mainAction": "string",
      "concreteResult": "string",
      "payReason": "string",
      "oneJobTemplate": "string"
    }
  ]
}
```

Обязательно: заполнен `oneJobTemplate` по шаблону Части 2.

### 4. `estimate_build`

**Вход:** один draft idea + signals context.

**Выход (`EstimateBuildResult`):**

```json
{
  "estimatedBuildDays": 10,
  "buildTimeConfidence": "low|medium|high",
  "mainTechnicalRisk": "string",
  "requiredIntegrations": ["string"],
  "featuresExcludedToFitDeadline": ["string"],
  "riskOfDeveloperHelp": "low|medium|high",
  "fourteenDayBuildPlan": [
    { "day": 1, "tasks": ["string"] }
  ],
  "narrowingApplied": false
}
```

Если `estimatedBuildDays > 14`: LLM предлагает сужение (`narrowingApplied: true`) или pipeline вызывает F4-02 helper.

### 5. `score_breakdown`

**Вход:** полный draft + build estimate.

**Выход (`ScoreBreakdownResult`):**

```json
{
  "oneJob": {
    "explainableInOneSentence": 100,
    "singlePrimaryUser": 100
  },
  "aiBuildability": {
    "typicalArchitecture": 100
  },
  "firstSale": {
    "audienceConcentrated": 50,
    "negatives": {
      "longEnterpriseCycle": false
    }
  }
}
```

Каждый критерий: **0 | 50 | 100** (`AI_PIPELINE.md`).  
Сервер сохраняет в `ideas.score_breakdown` и вызывает F4 для int-скоров.

### 6. `draft_sales_block` (может быть частью draft_ideas или отдельным вызовом)

**Выход (`SalesBlockResult`):**

```json
{
  "firstCustomerPersona": "string",
  "whereToFindCustomers": "string",
  "painStatement": "string",
  "shortOffer": "string",
  "primaryAcquisitionChannel": "string",
  "howToShowResult": "string",
  "recommendedCta": "string",
  "simplePrice": "string",
  "howToGetFirstPayment": "string",
  "continueCriteria": "string",
  "stopCriteria": "string"
}
```

`continueCriteria` / `stopCriteria` = бывшие go/kill (`DECISIONS.md`).

## Промпты

- Хранить в `AnalyticProject/src/lib/llm/prompts/*.ts` (не в UI).
- Версионировать через константу `PROMPT_VERSION` в run metadata (опционально MVP).
- Не логировать полные тексты сигналов в production (PII).

## Тестовые фикстуры

| Фикстура | Назначение |
|---|---|
| `fixtures/llm/extract-pains.json` | F5-03 extract |
| `fixtures/llm/cluster-pains.json` | F5-03 cluster |
| `fixtures/llm/draft-ideas-recommended.json` | E2E happy path |
| `fixtures/llm/draft-ideas-excluded.json` | Flow B |
| `fixtures/llm/estimate-build.json` | ≤14 days build |
| `fixtures/llm/estimate-build-over14.json` | narrowing path |
| `fixtures/llm/score-breakdown-recommended.json` | F4 thresholds pass |
| `fixtures/llm/sales-block.json` | first-sale card fields |

Mock provider читает fixture по `opts.fixture` (или default / env `LLM_FIXTURE`).

**Версии схем (код = SSOT runtime):** Zod в `AnalyticProject/src/lib/llm/schemas.ts` — `ExtractPainsResult`, `ClusterPainsResult`, `DraftIdeasResult`, `EstimateBuildResult`, `ScoreBreakdownResult`, `SalesBlockResult`. Расхождение с этим файлом → править код или этот документ.

## Не входит

- Fine-tuning; RAG; embeddings; multi-provider fallback; streaming в UI.
- LLM на user rescore (F7 — heuristic + F4 only).
