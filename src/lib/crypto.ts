import crypto from 'crypto';

/**
 * Generates a cryptographically secure numeric OTP of specified length.
 * Default: 6 digits (e.g., "492019")
 */
export function generateOtp(length: number = 6): string {
  if (length <= 0) throw new Error('OTP length must be greater than 0');
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Uses a double-HMAC pattern to safely compare strings of arbitrary lengths
 * without leaking length information via early returns.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const key = crypto.randomBytes(32);
  const hashA = crypto.createHmac('sha256', key).update(a).digest();
  const hashB = crypto.createHmac('sha256', key).update(b).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Verifies Razorpay Webhook HMAC-SHA256 signature against the raw body text.
 */
export function verifyRazorpaySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return timingSafeEqual(signature, expectedSignature);
}

/**
 * SHA-256 hash helper for strings (useful for token hashing, idempotency hashes).
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
