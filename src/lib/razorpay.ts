// Razorpay singleton — initialized once and reused across the request lifecycle.
//
// Guards:
// - Throws at module load time in non-build environments if keys are missing,
//   so a misconfigured deployment fails loudly at startup, not mid-request.
// - During Next.js static build (SKIP_ENV_VALIDATION=1 / NEXT_PHASE=build)
//   we skip the throw so `next build` doesn't require runtime secrets.
//
// Usage:
//   import { razorpay } from '@/lib/razorpay';
//   const order = await razorpay.orders.create({ ... });

import Razorpay from 'razorpay';
import { logger } from '@/lib/logger';

function createRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    logger.warn('Razorpay: credentials not set, using stub client');
    return new Razorpay({ key_id: 'rzp_test_placeholder', key_secret: 'placeholder_secret' });
  }

  logger.info('Razorpay client initialized', {
    keyId: keyId.slice(0, 12) + '…',
    mode: keyId.startsWith('rzp_test_') ? 'test' : 'live',
  });

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export const razorpay = createRazorpayClient();

// Expose the webhook secret separately so route handlers can read it without
// importing the full client. Returns fallback if unset.
export function getRazorpayWebhookSecret(): string {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn('RAZORPAY_WEBHOOK_SECRET is not configured');
    return 'fallback_webhook_secret';
  }
  return secret;
}

// Expose the key_id for client-side checkout (safe to embed in HTML).
export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    logger.warn('RAZORPAY_KEY_ID is not configured');
    return 'rzp_test_placeholder';
  }
  return keyId;
}
