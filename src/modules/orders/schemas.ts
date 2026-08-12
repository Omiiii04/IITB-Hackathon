import { z } from 'zod';

export const orderStatusEnum = z.enum([
  'AWAITING_PAYMENT',
  'PAYMENT_FAILED',
  'PAYMENT_SUCCESSFUL',
  'PROCESSING',
  'PARTIALLY_FULFILLED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
]);

export const subOrderStatusEnum = z.enum([
  'PLACED',
  'SELLER_ACCEPTED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]);

export const orderQuerySchema = z.object({
  status: orderStatusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type OrderStatusType = z.infer<typeof orderStatusEnum>;
export type SubOrderStatusType = z.infer<typeof subOrderStatusEnum>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;


