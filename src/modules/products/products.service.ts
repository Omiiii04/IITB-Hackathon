// Public read-only queries for the Product catalogue.
// Writes (create / update / delete) live in the seller module.

import { prisma } from '@/lib/prisma';
import type { ListProductsQuery } from './schemas';

// Fields exposed to the public — omits internal/admin fields.
const PUBLIC_PRODUCT_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  brand: true,
  images: true,
  basePrice: true,
  createdAt: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  store: {
    select: { id: true, storeName: true, slug: true },
  },
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      title: true,
      variantPrice: true,
      stock: true,
      attributes: true,
      imageUrl: true,
    },
  },
} as const;

// ─── listProducts ─────────────────────────────────────────────────────────────
export async function listProducts(query: ListProductsQuery) {
  const { categoryId, storeId, q, minPrice, maxPrice, sortBy, order, page, limit } = query;

  const where = {
    isActive: true,
    ...(categoryId && { categoryId }),
    ...(storeId && { storeId }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { brand: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          basePrice: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        }
      : {}),
  };

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: PUBLIC_PRODUCT_SELECT,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ─── getProductById ───────────────────────────────────────────────────────────
export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    select: PUBLIC_PRODUCT_SELECT,
  });
  return product ?? null;
}

// ─── getProductBySlug ─────────────────────────────────────────────────────────
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: PUBLIC_PRODUCT_SELECT,
  });
  return product ?? null;
}
