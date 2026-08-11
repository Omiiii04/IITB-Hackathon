import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock env before any auth module is imported.
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

// Mock auth.service to decouple API route tests from real DB and crypto.
vi.mock('@/modules/auth/auth.service', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/modules/auth/auth.service')>();
  return {
    ...original, // keep EmailAlreadyExistsError, hashPassword, verifyPassword
    registerUser: vi.fn(),
  };
});

// Mock prisma — login and refresh routes use it directly.
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { registerUser, EmailAlreadyExistsError } from '@/modules/auth/auth.service';
import { POST as registerRoute } from '@/app/api/auth/register/route';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { POST as refreshRoute } from '@/app/api/auth/refresh/route';
import { REFRESH_COOKIE_NAME, signRefreshToken } from '@/modules/auth/jwt';

const mockRegisterUser = registerUser as ReturnType<typeof vi.fn>;
const mockUserDb = prisma.user as { findUnique: ReturnType<typeof vi.fn> };

function makeRequest(body: unknown, cookies: Record<string, string> = {}): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
  return new NextRequest('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const validPayload = {
    email: 'alice@example.com',
    password: 'SecurePass1!',
    name: 'Alice',
    role: 'CUSTOMER',
  };

  it('returns 201 with user data on success', async () => {
    mockRegisterUser.mockResolvedValueOnce({
      id: 'uuid-001',
      email: 'alice@example.com',
      role: 'CUSTOMER',
    });

    const res = await registerRoute(makeRequest(validPayload));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({ id: 'uuid-001', email: 'alice@example.com' });
    // Must never expose passwordHash
    expect(body.data).not.toHaveProperty('passwordHash');
  });

  it('returns 409 when email already exists', async () => {
    mockRegisterUser.mockRejectedValueOnce(new EmailAlreadyExistsError('alice@example.com'));

    const res = await registerRoute(makeRequest(validPayload));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
    // Generic message — must not mention whether it's an OAuth or password account
    expect(body.error).toMatch(/already exists/i);
  });

  it('returns 422 for invalid input (missing password)', async () => {
    const res = await registerRoute(makeRequest({ email: 'bad@example.com' }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
  });

  it('returns 400 for non-JSON body', async () => {
    const req = new NextRequest('http://localhost:3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await registerRoute(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('returns 422 for a password that is too short', async () => {
    const res = await registerRoute(makeRequest({ ...validPayload, password: 'Short1' }));
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  const fakeUser = {
    id: 'uuid-002',
    email: 'bob@example.com',
    role: 'CUSTOMER',
    passwordHash: null as string | null,
    oauthId: null,
  };

  it('returns 401 for unknown email', async () => {
    mockUserDb.findUnique.mockResolvedValueOnce(null);

    const res = await loginRoute(makeRequest({ email: 'ghost@example.com', password: 'Any1Pass!' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Invalid email or password');
  });

  it('returns 401 for OAuth-only account (no passwordHash)', async () => {
    mockUserDb.findUnique.mockResolvedValueOnce({ ...fakeUser, passwordHash: null });

    const res = await loginRoute(makeRequest({ email: 'bob@example.com', password: 'Any1Pass!' }));
    const body = await res.json();

    // Same message as "wrong password" — prevents enumeration of account type
    expect(res.status).toBe(401);
    expect(body.error).toBe('Invalid email or password');
  });

  it('returns 401 for wrong password and sets the same generic error message', async () => {
    // Use a real Argon2id hash of 'CorrectPassword1' for realism.
    // We use a pre-computed hash to avoid slow Argon2 compute in route tests.
    // The real verifyPassword path is covered in password-hash.test.ts.
    const { hashPassword } = await import('@/modules/auth/auth.service');
    const hash = await hashPassword('CorrectPassword1');
    mockUserDb.findUnique.mockResolvedValueOnce({ ...fakeUser, passwordHash: hash });

    const res = await loginRoute(makeRequest({ email: 'bob@example.com', password: 'WrongPass9!' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Invalid email or password');
  });

  it('returns 200 with accessToken and user on valid credentials', async () => {
    const { hashPassword } = await import('@/modules/auth/auth.service');
    const hash = await hashPassword('ValidPass1!');
    mockUserDb.findUnique.mockResolvedValueOnce({ ...fakeUser, passwordHash: hash });

    const res = await loginRoute(makeRequest({ email: 'bob@example.com', password: 'ValidPass1!' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('accessToken');
    expect(typeof body.data.accessToken).toBe('string');
    expect(body.data.user).toMatchObject({ id: 'uuid-002', email: 'bob@example.com' });
    // Must not expose passwordHash in the response
    expect(body.data.user).not.toHaveProperty('passwordHash');
  });

  it('sets the refresh cookie on successful login', async () => {
    const { hashPassword } = await import('@/modules/auth/auth.service');
    const hash = await hashPassword('ValidPass1!');
    mockUserDb.findUnique.mockResolvedValueOnce({ ...fakeUser, passwordHash: hash });

    const res = await loginRoute(makeRequest({ email: 'bob@example.com', password: 'ValidPass1!' }));

    const cookies = res.headers.getSetCookie?.() ?? [];
    const refreshCookie = cookies.find((c) => c.startsWith(REFRESH_COOKIE_NAME));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toMatch(/HttpOnly/i);
  });

  it('returns 422 for missing email field', async () => {
    const res = await loginRoute(makeRequest({ password: 'ValidPass1!' }));
    expect(res.status).toBe(422);
  });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  const fakeUser = {
    id: 'uuid-003',
    email: 'carol@example.com',
    role: 'SELLER',
    passwordHash: null,
  };

  it('returns 401 when the refresh cookie is absent', async () => {
    const res = await refreshRoute(makeRequest({}));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('returns 401 for an invalid/malformed refresh token', async () => {
    const res = await refreshRoute(makeRequest({}, { [REFRESH_COOKIE_NAME]: 'invalid.token' }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('returns 401 when the user referenced by the token no longer exists', async () => {
    const token = signRefreshToken('deleted-user-id');
    mockUserDb.findUnique.mockResolvedValueOnce(null);

    const res = await refreshRoute(makeRequest({}, { [REFRESH_COOKIE_NAME]: token }));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Session expired');
  });

  it('returns 200 with a new accessToken for a valid refresh token', async () => {
    const token = signRefreshToken(fakeUser.id);
    mockUserDb.findUnique.mockResolvedValueOnce(fakeUser);

    const res = await refreshRoute(makeRequest({}, { [REFRESH_COOKIE_NAME]: token }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('accessToken');
    expect(body.data.user).toMatchObject({ id: fakeUser.id, email: fakeUser.email });
    expect(body.data.user).not.toHaveProperty('passwordHash');
  });

  it('rotates the refresh token on each valid use (Set-Cookie is re-issued)', async () => {
    const token = signRefreshToken(fakeUser.id);
    mockUserDb.findUnique.mockResolvedValueOnce(fakeUser);

    const res = await refreshRoute(makeRequest({}, { [REFRESH_COOKIE_NAME]: token }));

    // The response must include a Set-Cookie that re-issues the refresh cookie.
    // This confirms the rotation code path executed (a new token was issued and
    // the cookie was updated). We cannot guarantee the new value differs within
    // the same second because HS256 JWTs with the same payload and iat are
    // deterministic — that invariant is verified by integration tests over time.
    const cookies = res.headers.getSetCookie?.() ?? [];
    const refreshCookie = cookies.find((c) => c.startsWith(REFRESH_COOKIE_NAME));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toMatch(/HttpOnly/i);
  });
});
