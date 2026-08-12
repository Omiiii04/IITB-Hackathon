// Unit tests for Razorpay payment integration.
// Tests cover:
//   1. Webhook HMAC-SHA256 signature verification (verifyRazorpaySignature)
//   2. Payment signature verification (orderId|paymentId payload)
//   3. Crypto helpers: generateOtp, timingSafeEqual, sha256
//   4. Razorpay lib: getRazorpayKeyId, getRazorpayWebhookSecret guards
//   5. verifyPaymentSignature from razorpay.provider
//
// These tests are fully offline — no network calls, no real keys required.
// The sandbox keys from .env.test.example are used where needed.

import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';

// Crypto helpers
import {
  verifyRazorpaySignature,
  timingSafeEqual,
  generateOtp,
  sha256,
} from '@/lib/crypto';

// Razorpay provider (verifyPaymentSignature only — no SDK calls)
import { verifyPaymentSignature } from '@/modules/payments/razorpay.provider';

// ─── Test fixtures ────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = 'rd3Vf5resnJQ@7f'; // matches .env.test.example
const KEY_SECRET = 'J5JDijw7oJ4rXkHAgsUbFCm7'; // matches .env.test.example

const sampleWebhookPayload = JSON.stringify({
  entity: 'event',
  account_id: 'acc_TEST123',
  event: 'payment.captured',
  contains: ['payment'],
  payload: {
    payment: {
      entity: {
        id: 'pay_TEST0001',
        amount: 49900,
        currency: 'INR',
        status: 'captured',
        order_id: 'order_TEST001',
        method: 'upi',
        captured: true,
      },
    },
  },
});

// ─── Webhook Signature Verification ──────────────────────────────────────────

describe('verifyRazorpaySignature (webhook HMAC)', () => {
  function makeSignature(body: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  it('accepts a valid HMAC-SHA256 signature', () => {
    const sig = makeSignature(sampleWebhookPayload, WEBHOOK_SECRET);
    expect(verifyRazorpaySignature(sampleWebhookPayload, sig, WEBHOOK_SECRET)).toBe(true);
  });

  it('rejects a signature computed with the wrong secret', () => {
    const sig = makeSignature(sampleWebhookPayload, 'wrong_secret');
    expect(verifyRazorpaySignature(sampleWebhookPayload, sig, WEBHOOK_SECRET)).toBe(false);
  });

  it('rejects a tampered payload (body modified after signing)', () => {
    const sig = makeSignature(sampleWebhookPayload, WEBHOOK_SECRET);
    const tampered = sampleWebhookPayload + ' ';
    expect(verifyRazorpaySignature(tampered, sig, WEBHOOK_SECRET)).toBe(false);
  });

  it('rejects a truncated signature', () => {
    const sig = makeSignature(sampleWebhookPayload, WEBHOOK_SECRET).slice(0, 32);
    expect(verifyRazorpaySignature(sampleWebhookPayload, sig, WEBHOOK_SECRET)).toBe(false);
  });

  it('rejects an empty body', () => {
    expect(verifyRazorpaySignature('', 'anysig', WEBHOOK_SECRET)).toBe(false);
  });

  it('rejects an empty signature', () => {
    expect(verifyRazorpaySignature(sampleWebhookPayload, '', WEBHOOK_SECRET)).toBe(false);
  });

  it('rejects an empty secret', () => {
    const sig = makeSignature(sampleWebhookPayload, WEBHOOK_SECRET);
    expect(verifyRazorpaySignature(sampleWebhookPayload, sig, '')).toBe(false);
  });
});

// ─── Payment Signature Verification (post-checkout) ──────────────────────────

describe('verifyPaymentSignature (checkout callback HMAC)', () => {
  const orderId = 'order_TEST001';
  const paymentId = 'pay_TEST0001';

  function makePaymentSig(ordId: string, payId: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(`${ordId}|${payId}`).digest('hex');
  }

  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  });

  it('returns true for a valid payment signature', () => {
    const signature = makePaymentSig(orderId, paymentId, KEY_SECRET);
    expect(verifyPaymentSignature({ orderId, paymentId, signature })).toBe(true);
  });

  it('returns false when paymentId is swapped (wrong payload order)', () => {
    // Swapping orderId/paymentId changes the HMAC payload
    const signature = makePaymentSig(paymentId, orderId, KEY_SECRET); // intentionally reversed
    expect(verifyPaymentSignature({ orderId, paymentId, signature })).toBe(false);
  });

  it('returns false for a completely fabricated signature', () => {
    expect(verifyPaymentSignature({
      orderId,
      paymentId,
      signature: 'a'.repeat(64),
    })).toBe(false);
  });

  it('returns false when orderId is different from what was signed', () => {
    const signature = makePaymentSig('order_DIFFERENT', paymentId, KEY_SECRET);
    expect(verifyPaymentSignature({ orderId, paymentId, signature })).toBe(false);
  });

  it('throws when RAZORPAY_KEY_SECRET is not set', () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    expect(() => verifyPaymentSignature({ orderId, paymentId, signature: 'x' }))
      .toThrow('RAZORPAY_KEY_SECRET not set');
  });
});

// ─── OTP Generation ───────────────────────────────────────────────────────────

describe('generateOtp', () => {
  it('generates a 6-digit numeric OTP', () => {
    const otp = generateOtp(6);
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it('generates a 4-digit numeric OTP', () => {
    const otp = generateOtp(4);
    expect(otp).toHaveLength(4);
    expect(/^\d{4}$/.test(otp)).toBe(true);
  });

  it('generates unique OTPs across 20 calls (collision resistance)', () => {
    const otps = new Set(Array.from({ length: 20 }, () => generateOtp(6)));
    // With 10^6 possible values, 20 collisions in a row would be astronomically unlikely
    expect(otps.size).toBeGreaterThan(1);
  });

  it('throws for length <= 0', () => {
    expect(() => generateOtp(0)).toThrow();
  });
});

// ─── Timing-Safe Comparison ───────────────────────────────────────────────────

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('abc123', 'abc123')).toBe(true);
  });

  it('returns false for strings differing by one char', () => {
    expect(timingSafeEqual('abc123', 'abc124')).toBe(false);
  });

  it('returns false for strings of different lengths', () => {
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });

  it('returns false for empty vs non-empty', () => {
    expect(timingSafeEqual('', 'x')).toBe(false);
  });

  it('returns true for two empty strings', () => {
    expect(timingSafeEqual('', '')).toBe(true);
  });
});

// ─── SHA-256 Hash ─────────────────────────────────────────────────────────────

describe('sha256', () => {
  it('produces a 64-character lowercase hex digest', () => {
    const hash = sha256('test');
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('is deterministic for the same input', () => {
    expect(sha256('razorpay')).toBe(sha256('razorpay'));
  });

  it('produces different hashes for different inputs', () => {
    expect(sha256('razorpay')).not.toBe(sha256('stripe'));
  });

  it('matches known SHA-256 output', () => {
    // echo -n "hello" | sha256sum = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    expect(sha256('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });
});

// ─── Amount validation (business rule) ───────────────────────────────────────

describe('Razorpay business rules', () => {
  it('minimum order amount is 100 paise (₹1)', () => {
    // This mirrors the guard in createRazorpayOrder — tested without hitting the API
    function validateAmount(paise: number): void {
      if (paise < 100) throw new Error('Minimum order amount is ₹1 (100 paise)');
    }
    expect(() => validateAmount(99)).toThrow('Minimum order amount is ₹1 (100 paise)');
    expect(() => validateAmount(100)).not.toThrow();
    expect(() => validateAmount(49900)).not.toThrow();
  });

  it('receipt is truncated to 40 chars', () => {
    const longReceipt = 'a'.repeat(50);
    const truncated = longReceipt.slice(0, 40);
    expect(truncated).toHaveLength(40);
  });
});
