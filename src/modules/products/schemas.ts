import { z } from 'zod';

export const listProductsQuerySchema = z.object({
  categoryId: z.string().trim().optional(),
  storeId: z.string().uuid().optional(),
  q: z.string().trim().max(200).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['createdAt', 'basePrice', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10),
  brand: z.string().trim().max(100).optional(),
  images: z.array(z.string().url()).optional(),
  basePrice: z.number().positive(),
});

export const updateProductSchema = createProductSchema.partial();

export const variantSchema = z.object({
  sku: z.string().trim().min(1).max(64),
  title: z.string().trim().max(100).optional(),
  variantPrice: z.number().positive(),
  stock: z.number().int().min(0),
  attributes: z.record(z.string(), z.string()),
  imageUrl: z.string().url().optional(),
});

export const updateVariantSchema = variantSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;