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

const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build' ||
  process.env.SKIP_ENV_VALIDATION === '1' ||
  process.env.SKIP_ENV_VALIDATION === 'true';

function createRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    if (isBuildPhase) {
      // Return a dummy instance during build — it will never be called.
      logger.warn('Razorpay: keys not set during build phase, returning stub client');
      return new Razorpay({ key_id: 'rzp_build_dummy', key_secret: 'build_dummy_secret' });
    }
    throw new Error(
      'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables'
    );
  }

  logger.info('Razorpay client initialized', {
    keyId: keyId.slice(0, 12) + '…',
    mode: keyId.startsWith('rzp_test_') ? 'test' : 'live',
  });

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export const razorpay = createRazorpayClient();

// Expose the webhook secret separately so route handlers can read it without
// importing the full client. Throws at import time in non-build environments.
export function getRazorpayWebhookSecret(): string {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    if (isBuildPhase) return 'build_dummy_webhook_secret';
    throw new Error('RAZORPAY_WEBHOOK_SECRET must be set in environment variables');
  }
  return secret;
}

// Expose the key_id for client-side checkout (safe to embed in HTML).
export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    if (isBuildPhase) return 'rzp_build_dummy';
    throw new Error('RAZORPAY_KEY_ID must be set in environment variables');
  }
  return keyId;
}
