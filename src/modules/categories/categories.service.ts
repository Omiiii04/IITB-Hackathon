// Public read-only queries for the Category tree.
// Writes live in the admin module.

import { prisma } from '@/lib/prisma';
import type { ListCategoriesQuery } from './schemas';

// Fields exposed to the public.
const PUBLIC_CATEGORY_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  parentCategoryId: true,
} as const;

// ─── listCategories ───────────────────────────────────────────────────────────
export async function listCategories(query: ListCategoriesQuery) {
  const { parentId, activeOnly, withChildren } = query;

  const where = {
    ...(activeOnly && { isActive: true }),
    // When parentId is provided: fetch direct children.
    // When omitted: fetch root categories (parentCategoryId IS NULL).
    parentCategoryId: parentId ?? null,
  };

  const categories = await prisma.category.findMany({
    where,
    select: {
      ...PUBLIC_CATEGORY_SELECT,
      ...(withChildren && {
        subCategories: {
          where: activeOnly ? { isActive: true } : {},
          select: PUBLIC_CATEGORY_SELECT,
          orderBy: { name: 'asc' },
        },
      }),
    },
    orderBy: { name: 'asc' },
  });

  return categories;
}

// ─── getCategoryById ──────────────────────────────────────────────────────────
export async function getCategoryById(id: string) {
  const category = await prisma.category.findFirst({
    where: { id, isActive: true },
    select: {
      ...PUBLIC_CATEGORY_SELECT,
      subCategories: {
        where: { isActive: true },
        select: PUBLIC_CATEGORY_SELECT,
        orderBy: { name: 'asc' },
      },
    },
  });
  return category ?? null;
}
