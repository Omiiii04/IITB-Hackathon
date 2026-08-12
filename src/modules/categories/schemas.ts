import { z } from 'zod';

// ─── GET /api/categories — query-string params ───────────────────────────────
export const listCategoriesQuerySchema = z.object({
  /** When provided, return only direct children of this category */
  parentId: z.string().uuid().optional(),
  /** When true (default), exclude inactive categories */
  activeOnly: z.coerce.boolean().default(true),
  /** Include child subcategories nested inside each category */
  withChildren: z.coerce.boolean().default(false),
});

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
