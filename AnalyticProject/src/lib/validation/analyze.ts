import { z } from 'zod';

export { MANUAL_COOLDOWN_MS } from '@/lib/pipeline/constants';

export const analyzeBodySchema = z
  .object({
    trigger: z.enum(['initial', 'manual', 'scheduled']).optional(),
  })
  .strict();

