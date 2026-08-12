// FR-1.4: HTTP-only refresh cookie + in-memory access token session.
// Sign/verify for both token types. Two separate secrets (JWT_ACCESS_SECRET,
// JWT_REFRESH_SECRET) so a leaked access-token secret — higher blast radius,
// since access tokens are sent to the browser on every login/refresh —
// can't be used to forge long-lived refresh tokens, and vice versa.

import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';
import type { Role } from '@/types';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

export function signAccessToken(userId: string, role: Role): string {
  const payload: AccessTokenPayload = { sub: userId, role, type: 'access' };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string, sessionId: string): string {
  const payload: RefreshTokenPayload = { sub: userId, jti: sessionId, type: 'refresh' };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  if (typeof decoded === 'string' || decoded.type !== 'access') {
    throw new Error('Token is not a valid access token');
  }
  return decoded as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded === 'string' || decoded.type !== 'refresh') {
    throw new Error('Token is not a valid refresh token');
  }
  return decoded as RefreshTokenPayload;
}

export const REFRESH_COOKIE_NAME = 'refresh_token';

// httpOnly -> unreachable from JS (mitigates XSS token theft).
// secure   -> HTTPS only outside local dev.
// sameSite -> "lax" blocks the cookie on cross-site POSTs while still
//             allowing normal top-level navigation (e.g. the OAuth redirect).
// path     -> "/" so middleware / any route can check the cookie's mere
//             presence; the value itself stays unreadable by client JS
//             regardless of path.
export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: parseExpiryToSeconds(env.JWT_REFRESH_EXPIRES_IN),
  };
}

export function getRefreshTokenExpiry(): Date {
  const seconds = parseExpiryToSeconds(env.JWT_REFRESH_EXPIRES_IN);
  return new Date(Date.now() + seconds * 1000);
}

// Converts jsonwebtoken-style durations ("7d", "15m", "3600") to seconds for
// the cookie's maxAge, which expects a plain number.
function parseExpiryToSeconds(expiresIn: string): number {
  const match = /^(\d+)([smhd])?$/.exec(expiresIn.trim());
  if (!match) return 60 * 60 * 24 * 7; // fallback: 7 days

  const value = Number(match[1]);
  const unit = match[2] ?? 's';
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1;
  return value * multiplier;
}
