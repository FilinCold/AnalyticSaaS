import { z } from 'zod';

const keywordSchema = z
  .string()
  .trim()
  .min(1, 'Ключевое слово не может быть пустым')
  .max(100, 'Ключевое слово слишком длинное');

export const createResearchSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Укажите название')
    .max(200, 'Название слишком длинное'),
  topic: z
    .string()
    .trim()
    .min(1, 'Укажите тему')
    .max(500, 'Тема слишком длинная'),
  keywords: z.array(keywordSchema).max(20, 'Слишком много ключевых слов').default([]),
});

export const patchResearchSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Укажите название')
      .max(200, 'Название слишком длинное')
      .optional(),
    topic: z
      .string()
      .trim()
      .min(1, 'Укажите тему')
      .max(500, 'Тема слишком длинная')
      .optional(),
    keywords: z
      .array(keywordSchema)
      .max(20, 'Слишком много ключевых слов')
      .optional(),
    autoRefreshEnabled: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.topic !== undefined ||
      value.keywords !== undefined ||
      value.autoRefreshEnabled !== undefined,
    { message: 'Нужно хотя бы одно поле' },
  );

export type CreateResearchInput = z.infer<typeof createResearchSchema>;
export type PatchResearchInput = z.infer<typeof patchResearchSchema>;
