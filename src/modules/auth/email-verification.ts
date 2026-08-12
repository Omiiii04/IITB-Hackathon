import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '@/lib/env';

const EMAIL_VERIFY_SECRET = crypto
  .createHmac('sha256', env.JWT_ACCESS_SECRET)
  .update('email-verification')
  .digest('hex');

const EMAIL_VERIFY_EXPIRES_IN = '30m';

interface EmailVerificationPayload {
  sub: string; // userId
  email: string;
  type: 'email-verify';
}

export function signEmailVerificationToken(userId: string, email: string): string {
  const payload: EmailVerificationPayload = { sub: userId, email, type: 'email-verify' };
  return jwt.sign(payload, EMAIL_VERIFY_SECRET, { expiresIn: EMAIL_VERIFY_EXPIRES_IN });
}

export function verifyEmailVerificationToken(token: string): EmailVerificationPayload {
  const decoded = jwt.verify(token, EMAIL_VERIFY_SECRET);
  if (typeof decoded === 'string' || decoded.type !== 'email-verify') {
    throw new Error('Invalid or expired verification token');
  }
  return decoded as EmailVerificationPayload;
}
