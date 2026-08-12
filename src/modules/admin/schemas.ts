import { z } from 'zod';

export const updateStoreStatusSchema = z.object({
  status: z.enum(['APPROVED', 'SUSPENDED']),
  reason: z.string().trim().max(500).optional(),
});

export type UpdateStoreStatusInput = z.infer<typeof updateStoreStatusSchema>;