# Подшаг F1-01c — Login/Register UI

**Статус:** TODO  
**Родитель:** [../STEP.md](../STEP.md) · **После:** b-auth-provider

## Цель

Страницы `/login`, `/register`; после входа — redirect на `/researches` (пока placeholder list OK).

## Что сделать

1. `app/(auth)/login/page.tsx` — email, password, submit, errors
2. `app/(auth)/register/page.tsx` — email, password, confirm password
3. Client validation: email format, password min 8 chars
4. Link login ↔ register
5. Logout кнопка в layout (header) — `POST /api/auth/logout` или signOut()
6. Минимальный стиль Tailwind (без design system)

## DoD

- [ ] Manual Flow A step 1 в браузере
- [ ] Ошибки валидации показываются пользователю

## Журнал

- _(пусто)_
