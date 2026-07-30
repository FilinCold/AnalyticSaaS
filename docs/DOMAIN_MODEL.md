# DOMAIN_MODEL — предметная область MVP

## Сущности

### User
Аккаунт соло-создателя. Смотрит платформенную ленту идей (auth required).

### Research
**Внутренний** контейнер ingest/pipeline (system feed workspace).  
В MVP пользователь **не** обязан создавать Research. Обычно один system feed на платформу.

Поля (логика): `id`, `userId` (system owner или служебный user), `title`, `topic`, `keywords[]`, `status`, `autoRefreshEnabled` (default true), `lastPipelineFinishedAt`, timestamps.  
Опционально позже: `kind=system|user` — если понадобится явно.

### Signal
Сырой/нормализованный сигнал из открытого источника или ручного ввода (вторично).

Поля: `id`, `researchId` (system feed), `sourceType` (`manual`|`hackernews`|…), `sourceUrl?`, `rawText`, `normalizedText?`, `authorHint?`, `capturedAt`, `metadata` (JSON).

### PainCluster
Кластер повторяющихся болей, извлечённых из сигналов.

Поля: `id`, `researchId`, `label`, `summary`, `frequencyHint`, `signalIds[]`.

### Idea
Кандидат / рекомендованная / суженная / исключённая идея micro-SaaS.  
В UI попадает в **общую ленту** (платформенный каталог для всех auth-пользователей).

**Продуктовые атрибуты:** primaryUser, problem, inputDataType, mainAction, concreteResult, payReason, oneJobTemplate.

**Скоры:** oneJobScore, aiBuildabilityScore, firstSalePotential, estimatedBuildDays, opportunityScore, buildTimeConfidence.

**Build-блок:** mainTechnicalRisk, requiredIntegrations[], featuresExcludedToFitDeadline[], riskOfDeveloperHelp, fourteenDayBuildPlan.

**Sales-блок:** firstCustomerPersona, whereToFindCustomers, painStatement, shortOffer, primaryAcquisitionChannel, howToShowResult, recommendedCta, simplePrice, howToGetFirstPayment, continueCriteria, stopCriteria.

**Служебные:** status (`candidate`|`recommended`|`narrowed`|`excluded`), exclusionReasons[], supportingSignalIds[], supportingClusterIds[].

### PipelineRun
Запуск анализа system feed (Research).

Поля: `id`, `researchId`, `status` (`queued`|`running`|`succeeded`|`failed`), `trigger` (`initial`|`manual`|`scheduled`), `currentStep`, `error?`, timestamps.

## Связи

```
User                    (читает ленту; не владеет идеями в MVP)
System Research 1──* Signal
System Research 1──* PainCluster
System Research 1──* Idea          ← лента /ideas
System Research 1──* PipelineRun
Idea *──* Signal (supporting)
Idea *──* PainCluster (supporting)
```

## Инварианты

- Primary UX после login — лента Ideas, не Research create.
- В UI «основной список» только `status=recommended` **и** пороги: OneJob≥80, AI≥75, days≤14, FirstSale≥70.
- Вкладка «Суженные»: `status=narrowed` (система применила сужение; пользователь решает принять/исключить — Flow C).
- Вкладка «Исключённые»: `status=excluded` + `exclusionReasons`.
- Идея без обязательного шаблона one-job не может быть `recommended`.
- `estimatedBuildDays` всегда с поправкой на соло+AI (не senior-estimate).
- Идеи ленты не изолированы по userId в MVP (общий каталог).