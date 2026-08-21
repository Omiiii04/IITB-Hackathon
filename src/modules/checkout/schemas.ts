import { z } from 'zod';

export const shippingAddressInputSchema = z.object({
  recipientName: z.string().trim().min(1, 'Recipient name is required'),
  line1: z.string().trim().min(1, 'Address line 1 is required'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  postalCode: z.string().trim().regex(/^\d{6}$/, 'Must be a valid 6-digit Indian PIN code'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  country: z.string().trim().default('India'),
});

export const checkoutItemInputSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
});

export const createCheckoutInputSchema = z.object({
  items: z.array(checkoutItemInputSchema).min(1, 'Cart cannot be empty'),
  shippingAddress: shippingAddressInputSchema,
  couponCode: z.string().trim().optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressInputSchema>;
export type CheckoutItemInput = z.infer<typeof checkoutItemInputSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutInputSchema>;

export interface CheckoutOrderItemSummary {
  variantId: string;
  productTitle: string;
  variantTitle?: string;
  storeId: string;
  storeName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CheckoutResponseData {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  currency: string;
  amountPaise: number;
  razorpayOrderId: string;
  razorpayKeyId: string;
  reservationExpiresAt: string;
  items: CheckoutOrderItemSummary[];
}
