import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import {
  createStore,
  getMyStore,
  updateStore,
  StoreAlreadyExistsError,
  StoreNotFoundError,
} from '@/modules/seller/seller.service';
import { createStoreSchema, updateStoreSchema } from '@/modules/seller/schemas';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const body = await request.json();
  const parsed = createStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const store = await createStore(auth.userId, parsed.data);
    return NextResponse.json<ApiResponse>({ success: true, data: store }, { status: 201 });
  } catch (err) {
    if (err instanceof StoreAlreadyExistsError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You already have a store' },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const store = await getMyStore(auth.userId);
  if (!store) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'No store found' }, { status: 404 });
  }

  return NextResponse.json<ApiResponse>({ success: true, data: store });
}

export async function PATCH(request: NextRequest) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const body = await request.json();
  const parsed = updateStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const store = await updateStore(auth.userId, parsed.data);
    return NextResponse.json<ApiResponse>({ success: true, data: store });
  } catch (err) {
    if (err instanceof StoreNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'No store found' }, { status: 404 });
    }
    throw err;
  }
}