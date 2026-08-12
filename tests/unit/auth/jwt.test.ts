import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock @/lib/env before any auth module is imported, so the Zod parse
// at module-load time sees valid values and does not throw.
vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_ACCESS_SECRET: 'test_access_secret_minimum_32_chars!!',
    JWT_REFRESH_SECRET: 'test_refresh_secret_minimum_32_chars!',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    AI_PROVIDER: 'gemini',
  },
}));

import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@/modules/auth/jwt';

describe('JWT — signAccessToken / verifyAccessToken', () => {
  const userId = 'user-uuid-1234';
  const role = 'CUSTOMER' as const;

  it('signAccessToken returns a non-empty string', () => {
    const token = signAccessToken(userId, role);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('verifyAccessToken decodes the correct sub and role', () => {
    const token = signAccessToken(userId, role);
    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe(userId);
    expect(payload.role).toBe(role);
    expect(payload.type).toBe('access');
  });

  it('verifyAccessToken accepts SELLER role', () => {
    const token = signAccessToken(userId, 'SELLER');
    const payload = verifyAccessToken(token);
    expect(payload.role).toBe('SELLER');
    expect(payload.type).toBe('access');
  });

  it('verifyAccessToken throws on a malformed token', () => {
    expect(() => verifyAccessToken('not.a.jwt')).toThrow();
  });

  it('verifyAccessToken rejects a refresh token (different secret — invalid signature)', () => {
    // Refresh tokens are signed with JWT_REFRESH_SECRET; access token verifier
    // uses JWT_ACCESS_SECRET. Cross-secret use must always throw.
    const refreshToken = signRefreshToken(userId, 'session-id');
    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });

  it('verifyAccessToken throws on an empty string', () => {
    expect(() => verifyAccessToken('')).toThrow();
  });
});

describe('JWT — signRefreshToken / verifyRefreshToken', () => {
  const userId = 'user-uuid-5678';

  it('signRefreshToken returns a non-empty string', () => {
    const token = signRefreshToken(userId, 'session-id');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('verifyRefreshToken decodes the correct sub', () => {
    const token = signRefreshToken(userId, 'session-id');
    const payload = verifyRefreshToken(token);

    expect(payload.sub).toBe(userId);
    expect(payload.type).toBe('refresh');
  });

  it('verifyRefreshToken throws on a malformed token', () => {
    expect(() => verifyRefreshToken('bad.token.here')).toThrow();
  });

  it('verifyRefreshToken rejects an access token (different secret — invalid signature)', () => {
    // Access tokens are signed with JWT_ACCESS_SECRET; refresh token verifier
    // uses JWT_REFRESH_SECRET. Cross-secret use must always throw.
    const accessToken = signAccessToken(userId, 'ADMIN');
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });

  it('verifyRefreshToken throws on an empty string', () => {
    expect(() => verifyRefreshToken('')).toThrow();
  });

  it('access and refresh tokens signed with the same userId are distinct strings', () => {
    const access = signAccessToken(userId, 'CUSTOMER');
    const refresh = signRefreshToken(userId, 'session-id');
    // Different secrets + different payloads — must never be the same token.
    expect(access).not.toBe(refresh);
  });
});
