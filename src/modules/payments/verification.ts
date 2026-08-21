import { env } from '@/lib/env';
import { timingSafeEqual } from '@/lib/crypto';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

export class PaymentVerification {
  /**
   * Verifies the client callback signature returned by Razorpay Checkout.
   * Signature payload is: `${razorpayOrderId}|${razorpayPaymentId}` signed with RAZORPAY_KEY_SECRET.
   */
  static verifyCheckoutSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean {
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      logger.warn('RAZORPAY_KEY_SECRET is not configured; failing checkout signature verification');
      return false;
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const isValid = timingSafeEqual(razorpaySignature, expectedSignature);

    if (!isValid) {
      logger.warn('Razorpay checkout signature mismatch', {
        razorpayOrderId,
        razorpayPaymentId,
      });
    }

    return isValid;
  }

  /**
   * Verifies the Razorpay Webhook HMAC-SHA256 signature against the raw request body.
   */
  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.warn('RAZORPAY_WEBHOOK_SECRET is not configured; failing webhook signature verification');
      return false;
    }

    if (!rawBody || !signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isValid = timingSafeEqual(signature, expectedSignature);

    if (!isValid) {
      logger.warn('Razorpay webhook signature verification failed');
    }

    return isValid;
  }
}
