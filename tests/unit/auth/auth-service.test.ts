import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @/lib/env before any module importing it is evaluated.
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

// Mock @/lib/prisma so tests never require a real database connection.
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import {
  registerUser,
  findOrCreateGoogleUser,
  hashPassword,
  verifyPassword,
  EmailAlreadyExistsError,
} from '@/modules/auth/auth.service';
import type { GoogleProfile } from '@/modules/auth/schemas';

// Vitest's mock returns Prisma methods as vi.fn(). Cast for easier typing.
const mockUser = prisma.user as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── registerUser ────────────────────────────────────────────────────────────

describe('registerUser', () => {
  const validInput = {
    email: 'alice@example.com',
    password: 'SecurePass1!',
    name: 'Alice',
    role: 'CUSTOMER' as const,
  };

  const fakeDbUser = {
    id: 'uuid-001',
    email: 'alice@example.com',
    name: 'Alice',
    role: 'CUSTOMER',
    passwordHash: '$argon2id$fake',
    oauthId: null,
    oauthProvider: null,
    avatarUrl: null,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('creates a user and returns an AuthUser without passwordHash', async () => {
    mockUser.findUnique.mockResolvedValueOnce(null); // no existing user
    mockUser.create.mockResolvedValueOnce(fakeDbUser);

    const result = await registerUser(validInput);

    expect(result).toEqual({ id: 'uuid-001', email: 'alice@example.com', role: 'CUSTOMER' });
    // passwordHash must never appear in the returned object
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('oauthId');
  });

  it('calls prisma.user.create with a hashed (not plaintext) password', async () => {
    mockUser.findUnique.mockResolvedValueOnce(null);
    mockUser.create.mockResolvedValueOnce(fakeDbUser);

    await registerUser(validInput);

    const createCall = mockUser.create.mock.calls[0][0];
    expect(createCall.data.passwordHash).toBeDefined();
    expect(createCall.data.passwordHash).not.toBe(validInput.password);
    // Must be an Argon2id hash
    expect(createCall.data.passwordHash).toMatch(/^\$argon2id\$/);
  });

  it('throws EmailAlreadyExistsError when email is already registered', async () => {
    mockUser.findUnique.mockResolvedValueOnce(fakeDbUser); // existing user

    await expect(registerUser(validInput)).rejects.toThrow(EmailAlreadyExistsError);
  });

  it('EmailAlreadyExistsError does not leak account type (same error for OAuth and password accounts)', async () => {
    // Whether the existing account is OAuth-only or password-based, the same
    // error is thrown — preventing enumeration of account type.
    const oauthUser = { ...fakeDbUser, passwordHash: null, oauthId: 'google-sub-123' };
    mockUser.findUnique.mockResolvedValueOnce(oauthUser);

    await expect(registerUser(validInput)).rejects.toThrow(EmailAlreadyExistsError);
  });

  it('stores the role supplied in the input', async () => {
    const sellerInput = { ...validInput, role: 'SELLER' as const };
    const sellerDbUser = { ...fakeDbUser, role: 'SELLER' };

    mockUser.findUnique.mockResolvedValueOnce(null);
    mockUser.create.mockResolvedValueOnce(sellerDbUser);

    const result = await registerUser(sellerInput);
    expect(result.role).toBe('SELLER');
  });
});

// ─── findOrCreateGoogleUser ───────────────────────────────────────────────────

describe('findOrCreateGoogleUser', () => {
  const profile: GoogleProfile = {
    sub: 'google-sub-001',
    email: 'bob@example.com',
    email_verified: true,
    name: 'Bob',
    picture: 'https://example.com/bob.jpg',
  };

  const fakeOAuthUser = {
    id: 'uuid-002',
    email: 'bob@example.com',
    name: 'Bob',
    role: 'CUSTOMER',
    passwordHash: null,
    oauthId: 'google-sub-001',
    oauthProvider: 'GOOGLE',
    avatarUrl: 'https://example.com/bob.jpg',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('creates a new OAuth-only user when no existing account', async () => {
    mockUser.findUnique.mockResolvedValueOnce(null);
    mockUser.create.mockResolvedValueOnce(fakeOAuthUser);

    const result = await findOrCreateGoogleUser(profile);

    expect(result).toEqual({ id: 'uuid-002', email: 'bob@example.com', role: 'CUSTOMER' });
    expect(result).not.toHaveProperty('passwordHash');

    const createData = mockUser.create.mock.calls[0][0].data;
    expect(createData.passwordHash).toBeNull();
    expect(createData.oauthProvider).toBe('GOOGLE');
    expect(createData.oauthId).toBe('google-sub-001');
  });

  it('returns existing OAuth user as-is (no update) when oauthId already set', async () => {
    mockUser.findUnique.mockResolvedValueOnce(fakeOAuthUser); // already linked

    const result = await findOrCreateGoogleUser(profile);

    expect(result).toEqual({ id: 'uuid-002', email: 'bob@example.com', role: 'CUSTOMER' });
    // Must not call update — the account is already linked
    expect(mockUser.update).not.toHaveBeenCalled();
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it('links Google identity to an existing password account when oauthId is null', async () => {
    const existingPasswordUser = {
      ...fakeOAuthUser,
      oauthId: null,
      oauthProvider: null,
      passwordHash: '$argon2id$existing',
    };
    const linkedUser = { ...fakeOAuthUser }; // after linking

    mockUser.findUnique.mockResolvedValueOnce(existingPasswordUser);
    mockUser.update.mockResolvedValueOnce(linkedUser);

    const result = await findOrCreateGoogleUser(profile);

    expect(result).toEqual({ id: 'uuid-002', email: 'bob@example.com', role: 'CUSTOMER' });
    expect(mockUser.update).toHaveBeenCalledTimes(1);
    // Update must never touch passwordHash
    const updateData = mockUser.update.mock.calls[0][0].data;
    expect(updateData).not.toHaveProperty('passwordHash');
    expect(updateData.oauthProvider).toBe('GOOGLE');
  });
});
