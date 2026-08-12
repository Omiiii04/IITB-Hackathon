import { z } from 'zod';

export const createStoreSchema = z.object({
  storeName: z.string().trim().min(3).max(80),
  description: z.string().trim().max(1000).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const updateStoreSchema = createStoreSchema.partial();

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;