import crypto from 'crypto';

export function generateOtp(length: number = 6): string {
  return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
}

export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
