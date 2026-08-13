import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import {
  getMyProduct,
  updateProduct,
  deactivateProduct,
  NoStoreError,
  ProductNotFoundError,
} from '@/modules/products/products.service';
import { addVariant, DuplicateSkuError } from '@/modules/products/variant.service';
import { updateProductSchema, variantSchema } from '@/modules/products/schemas';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;

  try {
    const product = await getMyProduct(auth.userId, id);
    return NextResponse.json<ApiResponse>({ success: true, data: product });
  } catch (err) {
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No store found for this account' },
        { status: 403 },
      );
    }
    if (err instanceof ProductNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Product not found' }, { status: 404 });
    }
    throw err;
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;

  const body = await request.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const product = await updateProduct(auth.userId, id, parsed.data);
    return NextResponse.json<ApiResponse>({ success: true, data: product });
  } catch (err) {
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No store found for this account' },
        { status: 403 },
      );
    }
    if (err instanceof ProductNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Product not found' }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;

  try {
    await deactivateProduct(auth.userId, id);
    return NextResponse.json<ApiResponse>({ success: true, data: null });
  } catch (err) {
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No store found for this account' },
        { status: 403 },
      );
    }
    if (err instanceof ProductNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Product not found' }, { status: 404 });
    }
    throw err;
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = variantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const variant = await addVariant(auth.userId, id, parsed.data);
    return NextResponse.json<ApiResponse>({ success: true, data: variant }, { status: 201 });
  } catch (err) {
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No store found for this account' },
        { status: 403 },
      );
    }
    if (err instanceof ProductNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Product not found' }, { status: 404 });
    }
    if (err instanceof DuplicateSkuError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'SKU already in use' }, { status: 409 });
    }
    throw err;
  }
}