# Шаг F2-03 — Ideas feed shell + stats (primary home)

**Статус:** DONE  
**Слой:** Frontend (+ API stub)  
**Зависит от:** `01-model-crud`, F1-02; F2-02 secondary  
**ROADMAP:** [`docs/ROADMAP.md`](../../../../docs/ROADMAP.md) (F2-03) · **Фича:** `03-research`  
**Pivot:** [`docs/DECISIONS.md`](../../../../docs/DECISIONS.md) § 2026-07-30

## Перед началом

1. `docs/VISION.md`, `docs/MVP_SCOPE.md`, `docs/USER_FLOWS.md` (Flow A)
2. `docs/API.md` § Ideas (`GET /api/ideas` stub OK)
3. F2-01/F2-02 уже есть; Research UI — не home

## Цель

После login home = **лента идей** (news-portal shell): stats + empty/list placeholder. Без полного Ideas domain (F5/F6).

## Не входит

- Полная карточка идеи (F6-02)
- Вкладки narrowed/excluded (F6)
- Pipeline status UI (F5)
- Адаптеры (F3)
- Design system

## Подзадачи

### 1. Route `/ideas` + redirect после auth — DONE
### 2. Stats strip (shell) — DONE
### 3. Feed list empty state — DONE
### 4. Optional API stub — DONE `GET /api/ideas`
### 5. Research UI demote — DONE

## Файлы

- `AnalyticProject/src/app/(app)/ideas/page.tsx`
- `AnalyticProject/src/app/api/ideas/route.ts`
- `AnalyticProject/src/app/api/ideas/ideas.api.test.ts`
- `AnalyticProject/src/components/app-header.tsx`
- login/register/layout/middleware callbackUrl → `/ideas`

## Тест-кейсы

| # | Сценарий | Ожидание | Статус |
|---|---|---|---|
| T1 | Login | redirect `/ideas` | ✅ |
| T2 | Anonymous `/ideas` | login | ✅ middleware |
| T3 | Empty feed | empty state без create Research | ✅ |
| T4 | Nav | Ideas primary | ✅ |
| T5 | Manual Flow A шаг 2 | owner checklist | ⏳ |

## Критерии готовности (DoD)

- [x] T1–T4
- [x] Не ломает F2-01 API / F2-02 secondary routes
- [x] STATE → next F3-01

## Как отметить выполнение

1. Журнал. 2. Статус → `DONE`. 3. README фичи. 4. `04_STATE.md` → F3-01.

## Журнал

- `2026-07-30` — Pivot UX: `/ideas` shell + stats + `GET /api/ideas` stub; login→ideas; Research demoted; tests 35 green.
