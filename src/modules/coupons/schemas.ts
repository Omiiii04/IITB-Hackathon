import { z } from 'zod';
export const createCouponSchema = z.object({
  code: z.string().trim().min(3).max(30),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().positive(),
  minOrderValue: z.number().min(0).optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1),
  storeId: z.string().uuid(),
  cartTotal: z.number().positive(),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;