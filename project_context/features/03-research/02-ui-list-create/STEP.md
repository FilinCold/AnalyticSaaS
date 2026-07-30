# Шаг F2-02 — UI Research list/create

**Статус:** DONE (secondary UI; primary UX → F2-03)  
**Слой:** Frontend  
**Зависит от:** `01-model-crud`  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F2-02) · **Фича:** `03-research`

> **2026-07-30 pivot:** этот шаг больше не Flow A 1–2. Home = Ideas feed (`03-ideas-feed-shell`). Research UI — secondary (E2E/admin).

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
- `AnalyticProject/src/app/(app)/researches/[researchId]/not-found.tsx`
- `AnalyticProject/src/components/research/ResearchForm.tsx`
- `AnalyticProject/src/lib/research/keywords.ts`

## API / схема / поля

Использует API F2-01 без изменений.

## Тест-кейсы

| # | Сценарий | Ожидание | Статус |
|---|---|---|---|
| T1 | List пустой после регистрации | empty state | ✅ |
| T2 | Create с валидными полями | redirect detail, данные видны | ✅ |
| T3 | Create без title | ошибка в UI | ✅ (HTML required + API 400) |
| T4 | Direct URL чужого research | 404 page | ✅ |
| T5 | Manual Flow A шаги 1–2 | owner checklist | ⏳ |

## Блокеры

Нет.

## Критерии готовности (DoD)

- [x] T1–T4 (T5 manual — owner)
- [x] Не ломает auth middleware
- [x] Mobile-readable (базово, без pixel-perfect)

## Как проверить

```bash
npm run dev
# manual Flow A steps 1-2
# опционально:
npm run test:e2e -- research
```

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. README фичи (`../README.md`). 4. `04_STATE.md` → F3-01.

## Журнал

- `2026-07-30` — List (SSR prisma), `/researches/new` + ResearchForm, detail shell + not-found; keywords helper; lint/test/build OK; T1–T4 smoke OK.
