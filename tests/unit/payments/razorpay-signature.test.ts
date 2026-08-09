import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature, timingSafeEqual, generateOtp, sha256 } from '@/lib/crypto';

describe('Crypto & Signature Helpers', () => {
  const secret = 'webhook_secret_key_12345';
  const rawBody = JSON.stringify({
    entity: 'event',
    account_id: 'acc_123',
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_12345',
          amount: 50000,
          currency: 'INR',
          status: 'captured',
        },
      },
    },
  });

  it('should verify valid Razorpay signature correctly', () => {
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const isValid = verifyRazorpaySignature(rawBody, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it('should reject tampered payload or incorrect signature', () => {
    const tamperedBody = rawBody + ' ';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const isValid = verifyRazorpaySignature(tamperedBody, signature, secret);
    expect(isValid).toBe(false);
  });

  it('should generate 6-digit cryptographically secure numeric OTPs', () => {
    const otp = generateOtp(6);
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);

    const otp4 = generateOtp(4);
    expect(otp4).toHaveLength(4);
    expect(/^\d{4}$/.test(otp4)).toBe(true);
  });

  it('should perform timing-safe string comparison', () => {
    expect(timingSafeEqual('abcdef', 'abcdef')).toBe(true);
    expect(timingSafeEqual('abcdef', 'abcdeg')).toBe(false);
    expect(timingSafeEqual('abcdef', 'abc')).toBe(false);
  });

  it('should compute valid SHA-256 hash', () => {
    const hash = sha256('hello world');
    expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });
});
