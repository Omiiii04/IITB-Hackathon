import { prisma } from '@/lib/prisma';
import { getOwnStoreId } from '@/modules/auth/rbac';
import type { ListProductsQuery, CreateProductInput, UpdateProductInput } from './schemas';



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

export async function getProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    select: PUBLIC_PRODUCT_SELECT,
  });
  return product ?? null;
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: PUBLIC_PRODUCT_SELECT,
  });
  return product ?? null;
}

export class NoStoreError extends Error {}
export class ProductNotFoundError extends Error {}

export async function listMyProducts(userId: string) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  return prisma.product.findMany({
    where: { storeId, isActive: true },
    include: { variants: { where: { isActive: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProduct(userId: string, input: CreateProductInput) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  return prisma.product.create({
    data: { ...input, storeId },
  });
}

export async function getMyProduct(userId: string, productId: string) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const product = await prisma.product.findFirst({
    where: { id: productId, storeId, isActive: true },
    include: { variants: { where: { isActive: true } } },
  });

  if (!product) throw new ProductNotFoundError();
  return product;
}

export async function updateProduct(userId: string, productId: string, input: UpdateProductInput) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const result = await prisma.product.updateMany({
    where: { id: productId, storeId },
    data: input,
  });

  if (result.count === 0) throw new ProductNotFoundError();
  return getMyProduct(userId, productId);
}

export async function deactivateProduct(userId: string, productId: string) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const result = await prisma.product.updateMany({
    where: { id: productId, storeId },
    data: { isActive: false },
  });

  if (result.count === 0) throw new ProductNotFoundError();
}