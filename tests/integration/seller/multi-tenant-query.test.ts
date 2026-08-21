import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock env
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
      findMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

import { NextRequest } from 'next/server';
import { signAccessToken } from '@/modules/auth/jwt';
import { requireRole, requireStoreOwnership, isAuthError } from '@/modules/auth/rbac';
import { prisma } from '@/lib/prisma';

describe('Multi-Tenant Seller Isolation & Route Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows access only when authenticated seller matches store ownership', async () => {
    const sellerToken = signAccessToken('seller-1', 'SELLER');
    const req = new NextRequest('http://localhost:3000/api/seller/products', {
      headers: { authorization: `Bearer ${sellerToken}` },
    });

    const auth = requireRole(req, ['SELLER']);
    expect(isAuthError(auth)).toBe(false);

    if (!isAuthError(auth)) {
      vi.mocked(prisma.store.findUnique).mockResolvedValueOnce({
        id: 'store-1',
        sellerId: 'seller-1',
      } as any);

      const ownership = await requireStoreOwnership(auth.userId, 'store-1');
      expect(ownership.ok).toBe(true);
    }
  });

  it('rejects cross-tenant access when seller attempts to query another store', async () => {
    const sellerToken = signAccessToken('seller-attacker', 'SELLER');
    const req = new NextRequest('http://localhost:3000/api/seller/products', {
      headers: { authorization: `Bearer ${sellerToken}` },
    });

    const auth = requireRole(req, ['SELLER']);
    expect(isAuthError(auth)).toBe(false);

    if (!isAuthError(auth)) {
      vi.mocked(prisma.store.findUnique).mockResolvedValueOnce({
        id: 'store-victim',
        sellerId: 'seller-victim',
      } as any);

      const ownership = await requireStoreOwnership(auth.userId, 'store-victim');
      expect(ownership.ok).toBe(false);
      if (!ownership.ok) {
        expect(ownership.error.status).toBe(403);
      }
    }
  });

  it('strictly blocks CUSTOMER role from invoking SELLER/ADMIN endpoints', () => {
    const customerToken = signAccessToken('customer-99', 'CUSTOMER');
    const req = new NextRequest('http://localhost:3000/api/ai/generate-description', {
      headers: { authorization: `Bearer ${customerToken}` },
    });

    const auth = requireRole(req, ['SELLER', 'ADMIN']);
    expect(isAuthError(auth)).toBe(true);
    if (isAuthError(auth)) {
      expect(auth.error.status).toBe(403);
    }
  });
});
