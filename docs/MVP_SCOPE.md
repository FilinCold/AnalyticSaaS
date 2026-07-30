# MVP_SCOPE — окончательный scope MVP

## One Job MVP

Пользователь входит → видит **ленту идей** (news-portal UX) и сводную статистику → открывает карточку с build- и sales-блоками.  
Система сама собирает сигналы из адаптеров (любые ниши), гоняет pipeline и обновляет ленту по расписанию.  
**Research** — внутренний контейнер ingest/pipeline (system feed), не обязательный шаг пользователя.

## Входит в MVP

1. **Аккаунт:** регистрация/вход (email+password — Auth.js).
2. **Лента идей (primary UX):** список актуальных `recommended` (+ доступ к narrowed/excluded); сортировка Opportunity Score; метка актуальности / последнего обновления.
3. **Сводная статистика (shell):** число recommended / narrowed / excluded, дата последнего pipeline; без тяжёлой BI.
4. **Карточка идеи:** one-job шаблон; атрибуты; скоры; build-поля (Часть 4); sales-поля (Часть 5); `fourteenDayBuildPlan`; go/kill.
5. **Сигналы:**
   - **основной путь:** авто-адаптеры **Hacker News**, **Product Hunt**, **Reddit** → system feed;
   - ручной paste — вторичный (demo/E2E/admin);
   - хранение сырого текста + метаданных источника.
6. **Pipeline (фон):** normalize → extract pain → cluster → generate idea draft → score → filter → persist в ленту.
7. **Триггеры обновления ленты:**
   - **Первый прогон** — автоматически когда в system feed появляется ≥1 сигнал;
   - **Вручную** — кнопка «Обновить ленту» / «Запустить анализ» (auth);
   - **По расписанию** — каждые **3 календарных дня** (окно актуальности UX: 3–5 дней).
8. **Статусы идеи:** `candidate` | `recommended` | `narrowed` | `excluded` (+ причина).
9. **Повторный прогон** скоринга после ручного сужения полей (без полного re-ingest).
10. **Research (internal):** модель + API остаются для pipeline ownership; user-facing create Research **не** primary flow (`DECISIONS.md` 2026-07-30).

## Ручной happy path (E2E / Definition of Done для F8-01)

Пользователь за один проход (без проверки cron):

1. регистрируется / входит;
2. попадает на **ленту идей** (может быть пустой до первого pipeline);
3. (demo) система имеет ≥3 сигнала в system feed **или** operator/E2E добавляет signals / mock ingest;
4. pipeline стартует автоматически (при ≥1) **или** «Обновить ленту»;
5. ждёт статус job (queued → running → succeeded / failed);
6. видит ≥1 идею в ленте **или** явный empty/excluded с причинами + stats;
7. открывает карточку recommended со всеми обязательными полями;
8. понимает next steps по `fourteenDayBuildPlan` и sales-блоку.

_(Плановое обновление раз в 3 дня — отдельно, Flow A2.)_

## Не входит в MVP

См. `NON_GOALS.md`. Кратко: биллинг AnalyticSaaS, мультитенант-орги, источники сверх HN/PH/Reddit, кодоген micro-SaaS, лендинг-билдер, авто-outreach, UGC-маркетплейс, мобильное приложение, полноценный краулер «всего интернета».

## Контроль ширины scope платформы

AnalyticSaaS **сама** подчиняется one-job: не превращаться в «AI-платформу для предпринимателей». Любая фича вне vertical slice — post-MVP.
