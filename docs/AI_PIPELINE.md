# AI_PIPELINE — аналитический pipeline и формулы скоринга

## Pipeline (последовательность)

```
1. ingest_signals      → Signal rows (manual + 1 adapter)
2. normalize_signals   → cleaned text
3. extract_pains       → LLM: боли, аудитория, частота hints
4. cluster_pains       → PainCluster
5. draft_ideas         → Idea candidates (one-job template + attrs)
6. estimate_build      → days, risks, integrations, 14-day plan; narrow if needed
7. score_all           → One Job, AI Buildability, First Sale, Opportunity
8. apply_filters       → status recommended | narrowed | excluded
9. persist_and_finish  → Research.status = ready
```

Каждый шаг идемпотентен относительно `pipeline_run_id` где возможно. Ошибка шага → `pipeline_runs.failed` + сообщение.

## Сужение (до скоринга / внутри estimate_build)

Если draft не укладывается в 14 дней:

1. сузить формулировку;
2. убрать secondary → `featuresExcludedToFitDeadline`;
3. заменить автоматизацию ручным шагом;
4. переоценить days;
5. если всё ещё >14 → `excluded` + причина `exceeds_14_days`.

---

## Шкала критериев

Каждый атомарный критерий: **0 / 50 / 100**  
(нет / частично / да). Итоговый скор — среднее, округление до int.

---

## One Job Score

Критерии (равные веса):

1. `explainableInOneSentence`
2. `singlePrimaryUser`
3. `singleProblem`
4. `singleMainScenario`
5. `singleClearResult`
6. `valueOnOneExample`
7. `singleOfferLanding`
8. `canDropSecondaryWithoutLosingValue`

```
OneJobScore = round(avg(criteria_1..8))
```

Интерпретация: 90–100 ideal; 80–89 ok+scope control; 60–79 narrow; <60 platform/too broad.  
**Порог списка:** ≥ 80.

Hard gate: если идея не заполняет обязательный шаблон — max(OneJobScore, 59) принудительно или exclude.

---

## AI Buildability Score

Критерии (равные веса):

1. `typicalArchitecture`
2. `lowNonStandardCode` (инверсия «много нестандарта»)
3. `goodServiceDocs`
4. `fewIntegrations`
5. `officialApisAvailable`
6. `visuallyVerifiable`
7. `easyErrorDiagnosis`
8. `simpleDeploy`
9. `managedServicesOk`
10. `incrementalBuildPossible`
11. `manualFallbackPossible`

```
AIBuildabilityScore = round(avg(criteria_1..11))
```

Интерпретация: 90–100 great; 75–89 ok with strict MVP; 60–74 high debug risk; <60 unfit.  
**Порог списка:** ≥ 75.

---

## First Sale Potential

Позитивные критерии (равные веса):

1. `audienceConcentrated`
2. `buyerIsDecisionMaker`
3. `noLongApproval`
4. `shortSalesCycle`
5. `valueImmediate`
6. `demoInMinutes`
7. `dmOrSmallAdsStart`
8. `noBrandRequired`
9. `selfServiceOk`
10. `paymentRightAfterLaunch`

Негативные штрафы (каждый сработавший: −8 к сырой средней, floor 0):

- `longEnterpriseCycle`
- `multiPersonDecision`
- `requiresImplementation`
- `needsPersonalOnboarding`
- `valueAppearsInMonths`
- `highPriceNeedsApproval`
- `audienceHardToFind`
- `needsLargeUserBaseFirst`

```
raw = avg(positive_1..10)
FirstSalePotential = round(max(0, raw - 8 * count(true_negatives)))
```

**Порог списка:** ≥ 70.

Достаточное/недостаточное подтверждение спроса — продуктовые правила (`PRODUCT_PRINCIPLES.md`); в MVP хранятся как текст go/kill в карточке, не как отдельный трекер оплат.

---

## TimeFitScore (вспомогательный)

```
if estimatedBuildDays <= 10 → 100
else if <= 12 → 85
else if <= 14 → 70
else → 0
```

---

## Opportunity Score (ранжирование)

Только для идей, прошедших все пороги (или считается всегда, но UI сортирует recommended по нему):

```
OpportunityScore = round(
  0.30 * OneJobScore +
  0.25 * AIBuildabilityScore +
  0.30 * FirstSalePotential +
  0.15 * TimeFitScore
)
```

Идеи с `TimeFitScore = 0` не попадают в основной список (дублирует days≤14).

---

## Итоговый фильтр recommended

```
recommended iff
  OneJobScore >= 80
  AND AIBuildabilityScore >= 75
  AND estimatedBuildDays <= 14
  AND FirstSalePotential >= 70
  AND oneJobTemplate filled
```

Иначе: `excluded` (или `narrowed`, если сужение ещё применимо и после него проходит фильтр).

## LLM usage

- Structured output (JSON schema) для extract / draft / score breakdown.
- Температура низкая для скоринга.
- Хранить `score_breakdown` jsonb для объяснимости.
