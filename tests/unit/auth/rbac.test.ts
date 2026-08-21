import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @/lib/env before auth module import
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

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    store: {
      findUnique: vi.fn(),
    },
  },
}));

import { NextRequest } from 'next/server';
import { signAccessToken } from '@/modules/auth/jwt';
import { requireAuth, requireRole, getOwnStoreId, requireStoreOwnership, isAuthError } from '@/modules/auth/rbac';
import { prisma } from '@/lib/prisma';

describe('RBAC Helper — requireAuth & requireRole', () => {
  it('requireAuth returns 401 when Authorization header is missing', () => {
    const req = new NextRequest('http://localhost:3000/api/seller/store');
    const res = requireAuth(req);
    expect(isAuthError(res)).toBe(true);
    if (isAuthError(res)) {
      expect(res.error.status).toBe(401);
    }
  });

  it('requireAuth returns 401 when token is invalid or malformed', () => {
    const req = new NextRequest('http://localhost:3000/api/seller/store', {
      headers: { authorization: 'Bearer invalid.token.here' },
    });
    const res = requireAuth(req);
    expect(isAuthError(res)).toBe(true);
    if (isAuthError(res)) {
      expect(res.error.status).toBe(401);
    }
  });

  it('requireAuth extracts userId and role from valid Bearer token', () => {
    const token = signAccessToken('seller-123', 'SELLER');
    const req = new NextRequest('http://localhost:3000/api/seller/store', {
      headers: { authorization: `Bearer ${token}` },
    });
    const res = requireAuth(req);
    expect(isAuthError(res)).toBe(false);
    if (!isAuthError(res)) {
      expect(res.userId).toBe('seller-123');
      expect(res.role).toBe('SELLER');
    }
  });

  it('requireRole allows request when role matches allowedRoles', () => {
    const token = signAccessToken('seller-123', 'SELLER');
    const req = new NextRequest('http://localhost:3000/api/seller/store', {
      headers: { authorization: `Bearer ${token}` },
    });
    const res = requireRole(req, ['SELLER', 'ADMIN']);
    expect(isAuthError(res)).toBe(false);
    if (!isAuthError(res)) {
      expect(res.userId).toBe('seller-123');
      expect(res.role).toBe('SELLER');
    }
  });

  it('requireRole returns 403 Forbidden when role is not allowed', () => {
    const token = signAccessToken('customer-123', 'CUSTOMER');
    const req = new NextRequest('http://localhost:3000/api/seller/store', {
      headers: { authorization: `Bearer ${token}` },
    });
    const res = requireRole(req, ['SELLER', 'ADMIN']);
    expect(isAuthError(res)).toBe(true);
    if (isAuthError(res)) {
      expect(res.error.status).toBe(403);
    }
  });
});

describe('RBAC Helper — Store Ownership Scoping (Security Critical)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getOwnStoreId returns store ID for valid seller', async () => {
    vi.mocked(prisma.store.findUnique).mockResolvedValueOnce({ id: 'store-999' } as any);
    const storeId = await getOwnStoreId('seller-123');
    expect(storeId).toBe('store-999');
    expect(prisma.store.findUnique).toHaveBeenCalledWith({
      where: { sellerId: 'seller-123' },
      select: { id: true },
    });
  });

  it('getOwnStoreId returns null if seller has no store', async () => {
    vi.mocked(prisma.store.findUnique).mockResolvedValueOnce(null);
    const storeId = await getOwnStoreId('seller-without-store');
    expect(storeId).toBeNull();
  });

  it('requireStoreOwnership returns ok: true when user owns the store', async () => {
    vi.mocked(prisma.store.findUnique).mockResolvedValueOnce({ sellerId: 'seller-123' } as any);
    const result = await requireStoreOwnership('seller-123', 'store-999');
    expect(result.ok).toBe(true);
  });

  it('requireStoreOwnership returns ok: false and 403 status when user does NOT own the store', async () => {
    vi.mocked(prisma.store.findUnique).mockResolvedValueOnce({ sellerId: 'other-seller' } as any);
    const result = await requireStoreOwnership('seller-123', 'store-999');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(403);
    }
  });

  it('requireStoreOwnership returns ok: false and 403 status when store does not exist', async () => {
    vi.mocked(prisma.store.findUnique).mockResolvedValueOnce(null);
    const result = await requireStoreOwnership('seller-123', 'nonexistent-store');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.status).toBe(403);
    }
  });
});

describe('RBAC Helper — getServerAuth for Layouts & Server Components', () => {
  it('getServerAuth returns null if cookies header has no auth token or session', async () => {
    const { getServerAuth } = await import('@/modules/auth/rbac');
    const auth = await getServerAuth();
    expect(auth).toBeNull();
  });
});

