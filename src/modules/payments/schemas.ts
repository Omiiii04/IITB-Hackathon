import { z } from 'zod';

export const paymentVerificationInputSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

export const webhookPayloadSchema = z.object({
  entity: z.string().optional(),
  account_id: z.string().optional(),
  event: z.string().min(1, 'Event name is required'),
  contains: z.array(z.string()).optional(),
  payload: z.object({
    payment: z
      .object({
        entity: z.record(z.unknown()),
      })
      .optional(),
    order: z
      .object({
        entity: z.record(z.unknown()),
      })
      .optional(),
  }),
  created_at: z.number().optional(),
});

export type PaymentVerificationInput = z.infer<typeof paymentVerificationInputSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export interface PaymentVerificationResult {
  verified: boolean;
  orderId: string;
  orderNumber?: string;
  paymentStatus: string;
  transactionId: string;
}
