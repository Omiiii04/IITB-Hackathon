import { z } from 'zod';

// ─── GET /api/products — query-string params ─────────────────────────────────
// All fields are optional; defaults handle the first page with a sensible limit.
export const listProductsQuerySchema = z.object({
  /** Filter by category id */
  categoryId: z.string().uuid().optional(),
  /** Filter by store id */
  storeId: z.string().uuid().optional(),
  /** Full-text search on title / brand */
  q: z.string().trim().max(200).optional(),
  /** Minimum base price */
  minPrice: z.coerce.number().min(0).optional(),
  /** Maximum base price */
  maxPrice: z.coerce.number().min(0).optional(),
  /** Sort field */
  sortBy: z.enum(['createdAt', 'basePrice', 'title']).default('createdAt'),
  /** Sort direction */
  order: z.enum(['asc', 'desc']).default('desc'),
  /** 1-based page number */
  page: z.coerce.number().int().min(1).default(1),
  /** Items per page — capped at 100 */
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
