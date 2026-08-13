import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import { listMyProducts, createProduct, NoStoreError } from '@/modules/products/products.service';
import { createProductSchema } from '@/modules/products/schemas';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  try {
    const products = await listMyProducts(auth.userId);
    return NextResponse.json<ApiResponse>({ success: true, data: products });
  } catch (err) {
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No store found for this account' },
        { status: 403 },
      );
    }
    throw err;
  }
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const product = await createProduct(auth.userId, parsed.data);
    return NextResponse.json<ApiResponse>({ success: true, data: product }, { status: 201 });
  } catch (err) {
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No store found for this account' },
        { status: 403 },
      );
    }
    throw err;
  }
}