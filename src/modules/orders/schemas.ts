import { z } from 'zod';

export const genericSchema = z.object({
  id: z.string().optional(),
});
