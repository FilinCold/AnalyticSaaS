import { z } from 'zod';

export const createManualSignalSchema = z.object({
  rawText: z
    .string()
    .trim()
    .min(1, 'Укажите текст сигнала')
    .max(50_000, 'Текст слишком длинный'),
});

export type CreateManualSignalInput = z.infer<typeof createManualSignalSchema>;
