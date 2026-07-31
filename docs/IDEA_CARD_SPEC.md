# IDEA_CARD_SPEC — обязательные поля карточки идеи

> SSOT хранения: `docs/DATABASE.md` (таблица `ideas`).  
> UI: F6-02. API: `GET /api/ideas/:id` (`docs/API.md`).  
> F8-02: поля совпадают с Prisma `Idea` + serialize в `src/lib/idea/` (camelCase в JSON).

## Статусы

| status | Где показывать | Условие |
|---|---|---|
| `candidate` | Не в UI MVP (промежуточный pipeline) | После draft |
| `recommended` | Вкладка «Рекомендованные» | 4 порога + заполнен шаблон |
| `narrowed` | Вкладка «Суженные» | Системное сужение, не прошла recommended |
| `excluded` | Вкладка «Исключённые» | Не прошла пороги / one-job / days |

## Пороги recommended (инвариант)

```
oneJobScore >= 80
AND aiBuildabilityScore >= 75
AND estimatedBuildDays <= 14
AND firstSalePotential >= 70
AND oneJobTemplate IS NOT NULL AND non-empty
```

Сортировка списка recommended: `opportunityScore DESC`.

---

## Секции UI карточки

### 1. Заголовок

| Поле | DB column | Обязательно | Примечание |
|---|---|---|---|
| Проблема | `problem` | да | Краткий заголовок |
| Статус | `status` | да | Badge |
| Opportunity | `opportunity_score` | да | Только для recommended/narrowed |

### 2. One Job (Часть 2)

| Поле | DB column | Обязательно |
|---|---|---|
| Шаблон one-job | `one_job_template` | да |
| Primary user | `primary_user` | да |
| Problem | `problem` | да |
| Input data type | `input_data_type` | да |
| Main action | `main_action` | да |
| Concrete result | `concrete_result` | да |
| Pay reason | `pay_reason` | да |

### 3. Скоры

| Поле | DB column | Диапазон |
|---|---|---|
| One Job Score | `one_job_score` | 0–100 |
| AI Buildability | `ai_buildability_score` | 0–100 |
| First Sale Potential | `first_sale_potential` | 0–100 |
| Estimated build days | `estimated_build_days` | int |
| Opportunity Score | `opportunity_score` | 0–100 |

Опционально в MVP: collapsible `score_breakdown` (jsonb) для объяснимости.

### 4. Build-блок (Часть 4)

| Поле | DB column | Тип |
|---|---|---|
| Build time confidence | `build_time_confidence` | low \| medium \| high |
| Main technical risk | `main_technical_risk` | text |
| Required integrations | `required_integrations` | string[] |
| Features excluded to fit deadline | `features_excluded_to_fit_deadline` | string[] |
| Risk of developer help | `risk_of_developer_help` | low \| medium \| high |
| 14-day build plan | `fourteen_day_build_plan` | `{ day, tasks[] }[]` |

### 5. Sales-блок (Часть 5)

| Поле | DB column |
|---|---|
| First customer persona | `first_customer_persona` |
| Where to find customers | `where_to_find_customers` |
| Pain statement | `pain_statement` |
| Short offer | `short_offer` |
| Primary acquisition channel | `primary_acquisition_channel` |
| How to show result | `how_to_show_result` |
| Recommended CTA | `recommended_cta` |
| Simple price | `simple_price` |
| How to get first payment | `how_to_get_first_payment` |
| Continue criteria (go) | `continue_criteria` |
| Stop criteria (kill) | `stop_criteria` |

### 6. Исключение (если excluded)

| Поле | DB column |
|---|---|
| Причины | `exclusion_reasons` | string[] — коды: `below_one_job`, `below_ai`, `below_first_sale`, `exceeds_14_days`, `platform_idea`, … |

### 7. Provenance (служебное, collapsible)

| Поле | DB column |
|---|---|
| Supporting signals | `supporting_signal_ids` |
| Supporting clusters | `supporting_cluster_ids` |

---

## Редактируемые поля (F7)

Только subset для сужения:

- `features_excluded_to_fit_deadline`
- `main_action` (опционально)
- `concrete_result` (опционально)

Остальные поля read-only в MVP.

---

## Contract test (F6-02)

Snapshot или schema test: для fixture idea со `status=recommended` ответ API содержит **все** поля из секций 2–5 с non-null значениями.

## Не входит

Редактор всех полей; PDF export; комментарии; версионирование карточки.
