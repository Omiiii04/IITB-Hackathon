import { z } from 'zod';

export const updateStoreStatusSchema = z.object({
  status: z.enum(['APPROVED', 'SUSPENDED']),
  reason: z.string().trim().max(500).optional(),
});

export type UpdateStoreStatusInput = z.infer<typeof updateStoreStatusSchema>;

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().url().optional(),
  parentCategoryId: z.string().uuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;