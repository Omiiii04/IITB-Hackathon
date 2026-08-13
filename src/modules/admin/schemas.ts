import { z } from 'zod';

export const updateStoreStatusSchema = z.object({
  status: z.enum(['APPROVED', 'SUSPENDED']),
  reason: z.string().trim().max(500).optional(),
});

export const listUsersQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  role: z.enum(['CUSTOMER', 'SELLER', 'DELIVERY', 'ADMIN']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type UpdateStoreStatusInput = z.infer<typeof updateStoreStatusSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().url().optional(),
  parentCategoryId: z.string().uuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
