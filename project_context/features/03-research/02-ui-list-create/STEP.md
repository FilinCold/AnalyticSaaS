# Шаг F2-02 — UI Research list/create

**Статус:** TODO  
**Слой:** Frontend  
**Зависит от:** `01-model-crud`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F2-02) · **Фича:** `03-research`

## Перед началом

1. `docs/ROADMAP.md` (F2-02)
2. `docs/USER_FLOWS.md` (Flow A шаги 1–2)
3. `docs/MVP_SCOPE.md` § Research
4. `docs/API.md` § Researches
5. F2-01 завершён

## Цель

Страницы: список исследований, форма создания, detail shell (без signals/ideas — они в F3/F6).

## Не входит

- Красивый design system, тёмная тема
- Signals paste (F3)
- Pipeline status (F5)
- Ideas tabs (F6)
- Удаление research (post-MVP, если не в scope)

## Подзадачи

### 1. App layout для authenticated area

- `app/(app)/layout.tsx` — header: logo, user email, logout
- Nav: «Исследования» → `/researches`

### 2. List page `GET /researches`

- `app/(app)/researches/page.tsx`
- Fetch `GET /api/researches` (server component или client + SWR)
- Table/cards: title, topic, status, createdAt
- Empty state: «Создайте первое исследование» + CTA
- Link на detail: `/researches/[id]`

### 3. Create flow

- `app/(app)/researches/new/page.tsx` или modal на list
- Fields: title*, topic*, keywords (comma-separated → array)
- Submit → POST → redirect to detail
- Inline errors от API 400

### 4. Detail shell `GET /researches/[id]`

- `app/(app)/researches/[id]/page.tsx`
- Показать title, topic, keywords, status
- Placeholder секции: «Сигналы» (F3), «Идеи» (F6) — заголовки без логики
- Breadcrumb: Researches / {title}

### 5. Smoke E2E (опционально на этом шаге)

- Playwright: login → create research → see in list  
  _(полный e2e setup может быть отложен до F8 — минимум manual checklist)_

## Файлы

- `AnalyticProject/src/app/(app)/researches/page.tsx`
- `AnalyticProject/src/app/(app)/researches/new/page.tsx`
- `AnalyticProject/src/app/(app)/researches/[researchId]/page.tsx`
- `AnalyticProject/src/components/research/ResearchForm.tsx`

## API / схема / поля

Использует API F2-01 без изменений.

## Тест-кейсы

| # | Сценарий | Ожидание |
|---|---|---|
| T1 | List пустой после регистрации | empty state |
| T2 | Create с валидными полями | redirect detail, данные видны |
| T3 | Create без title | ошибка в UI |
| T4 | Direct URL чужого research | 404 page |
| T5 | Manual Flow A шаги 1–2 | owner checklist |

## Блокеры

Нет.

## Критерии готовности (DoD)

- [ ] T1–T5 (T5 manual OK)
- [ ] Не ломает auth middleware
- [ ] Mobile-readable (базово, без pixel-perfect)

## Как проверить

```bash
npm run dev
# manual Flow A steps 1-2
# опционально:
npm run test:e2e -- research
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. `04_STATE.md` → F3-01.

## Журнал

- _(пусто)_
