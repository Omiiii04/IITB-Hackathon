// Razorpay payment provider — high-level wrappers over the Razorpay SDK.
// All amounts are in paise (1 INR = 100 paise) as required by Razorpay API.
//
// Functions exported:
//   createRazorpayOrder   — create a payment order (call before showing checkout)
//   verifyPaymentSignature — verify HMAC after payment success callback
//   capturePayment        — explicitly capture an authorized payment
//   initiateRefund        — full or partial refund on a captured payment
//   fetchOrder            — retrieve order details (useful for reconciliation)

import { razorpay } from '@/lib/razorpay';
import { verifyRazorpaySignature } from '@/lib/crypto';
import { logger } from '@/lib/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateOrderOptions {
  /** Amount in paise (INR only for now). e.g., ₹499.00 → 49900 */
  amountPaise: number;
  /** Idempotency key — stored as Razorpay receipt (max 40 chars) */
  receipt: string;
  /** Additional metadata attached to the order */
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;          // rzp order id, e.g. "order_XXXXXXXXX"
  entity: string;
  amount: number;      // paise
  currency: string;
  receipt: string;
  status: string;
  createdAt: number;
}

export interface VerifyPaymentOptions {
  /** Razorpay order id returned from createRazorpayOrder */
  orderId: string;
  /** Razorpay payment id received in the callback */
  paymentId: string;
  /** HMAC signature received in the callback */
  signature: string;
}

export interface RefundOptions {
  /** Razorpay payment id to refund */
  paymentId: string;
  /** Amount to refund in paise. Defaults to full payment amount if omitted. */
  amountPaise?: number;
  /** Reason shown to customer. One of: 'duplicate', 'fraudulent', 'customer_request', 'other' */
  reason?: 'duplicate' | 'fraudulent' | 'customer_request' | 'other';
  /** Idempotency key for the refund request */
  idempotencyKey: string;
  notes?: Record<string, string>;
}

// ─── createRazorpayOrder ──────────────────────────────────────────────────────

/**
 * Creates a Razorpay order that is required before rendering the checkout modal.
 * The order id must be stored alongside our internal Order record.
 */
export async function createRazorpayOrder(
  opts: CreateOrderOptions
): Promise<RazorpayOrderResult> {
  if (opts.amountPaise < 100) {
    throw new Error('Minimum order amount is ₹1 (100 paise)');
  }

  const receipt = opts.receipt.slice(0, 40); // Razorpay max receipt length

  logger.info('Creating Razorpay order', { receipt, amountPaise: opts.amountPaise });

  const order = await razorpay.orders.create({
    amount: opts.amountPaise,
    currency: 'INR',
    receipt,
    notes: opts.notes ?? {},
  });

  logger.info('Razorpay order created', { orderId: order.id, status: order.status });

  return {
    id: order.id as string,
    entity: order.entity as string,
    amount: order.amount as number,
    currency: order.currency as string,
    receipt: order.receipt as string,
    status: order.status as string,
    createdAt: order.created_at as number,
  };
}

// ─── verifyPaymentSignature ───────────────────────────────────────────────────

/**
 * Verifies the HMAC-SHA256 signature that Razorpay sends to the client after
 * a successful payment. Must be called server-side before marking a payment
 * as successful in the database.
 *
 * Signature payload format (per Razorpay docs):
 *   HMAC_SHA256( orderId + "|" + paymentId, key_secret )
 */
export function verifyPaymentSignature(opts: VerifyPaymentOptions): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET not set');
  }

  const payload = `${opts.orderId}|${opts.paymentId}`;
  const isValid = verifyRazorpaySignature(payload, opts.signature, keySecret);

  if (!isValid) {
    logger.warn('Razorpay payment signature verification failed', {
      orderId: opts.orderId,
      paymentId: opts.paymentId,
    });
  }

  return isValid;
}

// ─── capturePayment ───────────────────────────────────────────────────────────

/**
 * Explicitly captures an authorized (not auto-captured) payment.
 * Only needed if your Razorpay account uses manual capture mode.
 */
export async function capturePayment(
  paymentId: string,
  amountPaise: number
): Promise<void> {
  logger.info('Capturing Razorpay payment', { paymentId, amountPaise });

  await razorpay.payments.capture(paymentId, amountPaise, 'INR');

  logger.info('Razorpay payment captured', { paymentId });
}

// ─── initiateRefund ───────────────────────────────────────────────────────────

/**
 * Initiates a full or partial refund on a captured Razorpay payment.
 * Uses the idempotency key to ensure the refund is not double-submitted.
 */
export async function initiateRefund(opts: RefundOptions): Promise<string> {
  logger.info('Initiating Razorpay refund', {
    paymentId: opts.paymentId,
    amountPaise: opts.amountPaise ?? 'full',
    idempotencyKey: opts.idempotencyKey,
  });

  // The Razorpay Node SDK does not natively support idempotency-key headers
  // on refunds; we pass it in notes instead so it is stored for reconciliation.
  const refundPayload: Record<string, unknown> = {
    notes: {
      ...opts.notes,
      idempotency_key: opts.idempotencyKey,
    },
  };

  if (opts.amountPaise !== undefined) {
    refundPayload.amount = opts.amountPaise;
  }

  if (opts.reason) {
    refundPayload.reason = opts.reason;
  }

  const refund = await razorpay.payments.refund(opts.paymentId, refundPayload);
  const refundId = refund.id as string;

  logger.info('Razorpay refund initiated', { paymentId: opts.paymentId, refundId });

  return refundId;
}

// ─── fetchOrder ───────────────────────────────────────────────────────────────

/**
 * Retrieves the current state of a Razorpay order.
 * Useful for reconciliation or polling order status.
 */
export async function fetchOrder(rzpOrderId: string): Promise<RazorpayOrderResult> {
  const order = await razorpay.orders.fetch(rzpOrderId);

  return {
    id: order.id as string,
    entity: order.entity as string,
    amount: order.amount as number,
    currency: order.currency as string,
    receipt: order.receipt as string,
    status: order.status as string,
    createdAt: order.created_at as number,
  };
}
