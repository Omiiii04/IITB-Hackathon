import { prisma } from '@/lib/prisma';
import { getOwnStoreId } from '@/modules/auth/rbac';
import type { VariantInput, UpdateVariantInput } from './schemas';

export class NoStoreError extends Error {}
export class ProductNotFoundError extends Error {}
export class VariantNotFoundError extends Error {}
export class DuplicateSkuError extends Error {}

async function assertOwnsProduct(storeId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId, isActive: true },
    select: { id: true },
  });
  if (!product) throw new ProductNotFoundError();
}

export async function addVariant(userId: string, productId: string, input: VariantInput) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();
  await assertOwnsProduct(storeId, productId);

  const existingSku = await prisma.productVariant.findUnique({ where: { sku: input.sku } });
  if (existingSku) throw new DuplicateSkuError();

  return prisma.productVariant.create({
    data: { ...input, productId, storeId },
  });
}

export async function updateVariant(userId: string, variantId: string, input: UpdateVariantInput) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  if (input.sku) {
    const existingSku = await prisma.productVariant.findFirst({
      where: { sku: input.sku, NOT: { id: variantId } },
    });
    if (existingSku) throw new DuplicateSkuError();
  }

  const result = await prisma.productVariant.updateMany({
    where: { id: variantId, storeId },
    data: input,
  });

  if (result.count === 0) throw new VariantNotFoundError();
  return prisma.productVariant.findUnique({ where: { id: variantId } });
}

export async function deactivateVariant(userId: string, variantId: string) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const result = await prisma.productVariant.updateMany({
    where: { id: variantId, storeId },
    data: { isActive: false },
  });

  if (result.count === 0) throw new VariantNotFoundError();
}