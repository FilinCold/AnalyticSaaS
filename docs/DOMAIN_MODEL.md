# DOMAIN_MODEL — предметная область MVP

## Сущности

### User
Владелец исследований. Соло-аккаунт.

### Research
Исследование по нише/теме. Контейнер сигналов и идей.

Поля (логика): `id`, `userId`, `title`, `topic`, `keywords[]`, `status`, `autoRefreshEnabled` (default true), `lastPipelineFinishedAt`, timestamps.

### Signal
Сырой/нормализованный сигнал из открытого источника или ручного ввода.

Поля: `id`, `researchId`, `sourceType` (`manual`|`reddit`|…), `sourceUrl?`, `rawText`, `normalizedText?`, `authorHint?`, `capturedAt`, `metadata` (JSON).

### PainCluster
Кластер повторяющихся болей, извлечённых из сигналов.

Поля: `id`, `researchId`, `label`, `summary`, `frequencyHint`, `signalIds[]`.

### Idea
Кандидат / рекомендованная / суженная / исключённая идея micro-SaaS.

**Продуктовые атрибуты:** primaryUser, problem, inputDataType, mainAction, concreteResult, payReason, oneJobTemplate.

**Скоры:** oneJobScore, aiBuildabilityScore, firstSalePotential, estimatedBuildDays, opportunityScore, buildTimeConfidence.

**Build-блок:** mainTechnicalRisk, requiredIntegrations[], featuresExcludedToFitDeadline[], riskOfDeveloperHelp, fourteenDayBuildPlan.

**Sales-блок:** firstCustomerPersona, whereToFindCustomers, painStatement, shortOffer, primaryAcquisitionChannel, howToShowResult, recommendedCta, simplePrice, howToGetFirstPayment, continueCriteria, stopCriteria.

**Служебные:** status (`candidate`|`recommended`|`narrowed`|`excluded`), exclusionReasons[], supportingSignalIds[], supportingClusterIds[].

### PipelineRun
Запуск анализа Research.

Поля: `id`, `researchId`, `status` (`queued`|`running`|`succeeded`|`failed`), `trigger` (`initial`|`manual`|`scheduled`), `currentStep`, `error?`, timestamps.

## Связи

```
User 1──* Research 1──* Signal
Research 1──* PainCluster
Research 1──* Idea
Research 1──* PipelineRun
Idea *──* Signal (supporting)
Idea *──* PainCluster (supporting)
```

## Инварианты

- В UI «основной список» только `status=recommended` **и** пороги: OneJob≥80, AI≥75, days≤14, FirstSale≥70.
- Вкладка «Суженные»: `status=narrowed` (система применила сужение; пользователь решает принять/исключить — Flow C).
- Вкладка «Исключённые»: `status=excluded` + `exclusionReasons`.
- Идея без обязательного шаблона one-job не может быть `recommended`.
- `estimatedBuildDays` всегда с поправкой на соло+AI (не senior-estimate).
