import { z } from 'zod';

const featureString = z
  .string()
  .trim()
  .min(1, 'Пустое название функции')
  .max(200, 'Слишком длинное название функции');

export const patchNarrowingSchema = z.object({
  featuresExcludedToFitDeadline: z
    .array(featureString)
    .max(20, 'Не больше 20 исключённых функций'),
  mainAction: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .optional(),
  concreteResult: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .optional(),
});

export type PatchNarrowingInput = z.infer<typeof patchNarrowingSchema>;
