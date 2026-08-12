// RBAC helper — role checks plus, critically, store-ownership scoping.
//
// Every seller-scoped route (products, variants, orders, coupons, inventory)
// MUST derive the storeId from the authenticated user via
// getOwnStoreId()/requireStoreOwnership() below — never trust a storeId the
// client sent in the request body/query directly. ProductVariant.storeId is
// denormalized specifically so these routes can filter with a flat

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/modules/auth/jwt';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Role } from '@/types';

export interface AuthContext {
  userId: string;
  role: Role;
}

type AuthResult = AuthContext | { error: NextResponse };

export function isAuthError(result: AuthResult): result is { error: NextResponse } {
  return 'error' in result;
}

// Reads Authorization: Bearer <access token> and verifies it. Deliberately
export function requireAuth(request: NextRequest): AuthResult {
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (!token) {
    return {
      error: NextResponse.json<ApiResponse>({ success: false, error: 'Not authenticated' }, { status: 401 }),
    };
  }

  try {
    const payload = verifyAccessToken(token);
    return { userId: payload.sub, role: payload.role };
  } catch {
    return {
      error: NextResponse.json<ApiResponse>({ success: false, error: 'Invalid or expired token' }, { status: 401 }),
    };
  }
}

export function requireRole(request: NextRequest, allowedRoles: Role[]): AuthResult {
  const auth = requireAuth(request);
  if (isAuthError(auth)) return auth;

  if (!allowedRoles.includes(auth.role)) {
    return {
      error: NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 }),
    };
  }

  return auth;
}


export async function getOwnStoreId(userId: string): Promise<string | null> {
  const store = await prisma.store.findUnique({ where: { sellerId: userId }, select: { id: true } });
  return store?.id ?? null;
}

export async function requireStoreOwnership(
  userId: string,
  storeId: string,
): Promise<{ ok: true } | { ok: false; error: NextResponse }> {
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { sellerId: true } });

  if (!store || store.sellerId !== userId) {
    return {
      ok: false,
      error: NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true };
}
