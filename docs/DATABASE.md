# DATABASE — схема MVP (логическая)

> Реализация: PostgreSQL + Prisma (предложение). Только таблицы MVP.

## Таблицы

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | text unique | |
| password_hash / auth provider ids | — | зависит от auth |
| created_at | timestamptz | |

### researches
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | index; MVP system feed — служебный owner user |
| title | text | |
| topic | text | для system feed: e.g. «Platform feed» / broad topic |
| keywords | text[] / jsonb | для system feed могут быть пустыми (любые ниши) |
| status | text | draft/running/ready/failed |
| auto_refresh_enabled | boolean | default true |
| last_pipeline_finished_at | timestamptz null | для cron 3 дня |
| created_at, updated_at | timestamptz | |

> Pivot 2026-07-30: Research = internal pipeline container; user не обязан создавать.

### signals
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| research_id | uuid FK | index |
| source_type | text | `manual` \| `reddit` \| `hackernews` \| `rss` \| … (конкретный адаптер MVP — `OPEN_QUESTIONS`) |
| source_url | text null | |
| raw_text | text | |
| normalized_text | text null | |
| author_hint | text null | |
| captured_at | timestamptz | |
| metadata | jsonb | default {} |

### pain_clusters
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| research_id | uuid FK | index |
| label | text | |
| summary | text | |
| frequency_hint | text/int | |
| signal_ids | uuid[] / join table | MVP: jsonb uuid[] ok |

### ideas
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| research_id | uuid FK | index |
| status | text | candidate/recommended/narrowed/excluded |
| primary_user | text | |
| problem | text | |
| input_data_type | text | |
| main_action | text | |
| concrete_result | text | |
| pay_reason | text | |
| one_job_template | text | |
| one_job_score | int | 0–100 |
| ai_buildability_score | int | 0–100 |
| first_sale_potential | int | 0–100 |
| estimated_build_days | int | |
| opportunity_score | int | 0–100 |
| build_time_confidence | text/int | см. семантика ниже |
| main_technical_risk | text | |
| required_integrations | jsonb | string[] |
| features_excluded_to_fit_deadline | jsonb | string[] |
| risk_of_developer_help | text/int | |
| fourteen_day_build_plan | jsonb/text | |
| first_customer_persona | text | |
| where_to_find_customers | text | |
| pain_statement | text | |
| short_offer | text | |
| primary_acquisition_channel | text | |
| how_to_show_result | text | |
| recommended_cta | text | |
| simple_price | text | |
| how_to_get_first_payment | text | |
| continue_criteria | text | sales «go» — когда продолжать |
| stop_criteria | text | sales «kill» — когда остановиться |
| exclusion_reasons | jsonb | string[] |
| supporting_signal_ids | jsonb | uuid[] |
| supporting_cluster_ids | jsonb | uuid[] |
| score_breakdown | jsonb | детали критериев |
| created_at, updated_at | timestamptz | |

**Индекс основного списка:** `(research_id, status, opportunity_score DESC)` partial where status='recommended'.

### pipeline_runs
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| research_id | uuid FK | index |
| status | text | |
| trigger | text | initial / manual / scheduled |
| current_step | text null | |
| error | text null | |
| created_at, finished_at | timestamptz | |

## Семантика вспомогательных полей (MVP)

- `build_time_confidence`: `low` | `medium` | `high` (насколько устойчива оценка days).
- `risk_of_developer_help`: `low` | `medium` | `high` (вероятность, что соло упрётся в необходимость нанять разработчика).
- `fourteen_day_build_plan`: JSON массив дней/шагов `{ day, tasks[] }`.

## Что не моделируем в MVP

orgs, roles, billing, share links, multiple adapters config UI, vector DB (можно позже), embeddings table (опционально post-MVP).
