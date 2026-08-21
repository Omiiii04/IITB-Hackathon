import { prisma } from '@/lib/prisma';
import { getOwnStoreId } from '@/modules/auth/rbac';
import type { DiscountType } from '@prisma/client';
import type { CreateCouponInput } from './schemas';

export class NoStoreError extends Error {}
export class CouponNotFoundError extends Error {}
export class DuplicateCouponCodeError extends Error {}
export class CouponInvalidError extends Error {}

function toPrismaDiscountType(type: 'PERCENTAGE' | 'FLAT'): DiscountType {
  return type === 'FLAT' ? 'FIXED_AMOUNT' : 'PERCENTAGE';
}

function toApiDiscountType(type: DiscountType): 'PERCENTAGE' | 'FLAT' {
  return type === 'FIXED_AMOUNT' ? 'FLAT' : 'PERCENTAGE';
}

function toApiCoupon<T extends { discountType: DiscountType }>(coupon: T) {
  return { ...coupon, discountType: toApiDiscountType(coupon.discountType) };
}

export async function listMyCoupons(userId: string) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const coupons = await prisma.coupon.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
  });

  return coupons.map(toApiCoupon);
}

export async function createCoupon(userId: string, input: CreateCouponInput) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const code = input.code.trim().toUpperCase();

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) throw new DuplicateCouponCodeError();

  const coupon = await prisma.coupon.create({
    data: {
      storeId,
      code,
      discountType: toPrismaDiscountType(input.discountType),
      discountValue: input.discountValue,
      minOrderValue: input.minOrderValue ?? 0,
      maxUses: input.maxUses ?? 100,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    },
  });

  return toApiCoupon(coupon);
}

export async function deleteCoupon(userId: string, couponId: string) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const result = await prisma.coupon.deleteMany({ where: { id: couponId, storeId } });
  if (result.count === 0) throw new CouponNotFoundError();
}

export async function validateCouponForStore(code: string, storeId: string, cartTotal: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || coupon.storeId !== storeId || !coupon.isActive) {
    throw new CouponInvalidError();
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new CouponInvalidError();
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new CouponInvalidError();
  }
  if (cartTotal < coupon.minOrderValue) {
    throw new CouponInvalidError();
  }

  const discountAmount =
    coupon.discountType === 'PERCENTAGE'
      ? Math.min(
          (cartTotal * coupon.discountValue) / 100,
          coupon.maxDiscountAmount ?? Infinity,
        )
      : coupon.discountValue;

  return { couponId: coupon.id, discountAmount: Math.round(discountAmount * 100) / 100 };
}