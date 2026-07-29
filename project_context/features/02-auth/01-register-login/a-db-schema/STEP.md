# Подшаг F1-01a — DB schema users

**Статус:** TODO  
**Родитель:** [../STEP.md](../STEP.md)

## Цель

Prisma model `User` (+ auth tables если Auth.js: Account, Session, VerificationToken).

## Что сделать

1. Добавить в `schema.prisma`:
   ```prisma
   model User {
     id        String   @id @default(uuid())
     email     String   @unique
     // passwordHash или relation к Account — по выбору auth
     createdAt DateTime @default(now()) @map("created_at")
     @@map("users")
   }
   ```
2. Auth.js: добавить стандартные модели из adapter docs
3. `npx prisma migrate dev --name add_users`
4. Не добавлять `Research` пока (F2)

## DoD

- [ ] Migrate на чистой БД после F0-02 baseline
- [ ] `prisma.user` доступен в types

## Журнал

- _(пусто)_
