import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import {
  listMyCoupons,
  createCoupon,
  NoStoreError,
  DuplicateCouponCodeError,
} from '@/modules/coupons/coupons.service';
import { createCouponSchema } from '@/modules/coupons/schemas';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  try {
    const coupons = await listMyCoupons(auth.userId);
    return NextResponse.json<ApiResponse>({ success: true, data: coupons });
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
  const parsed = createCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const coupon = await createCoupon(auth.userId, parsed.data);
    return NextResponse.json<ApiResponse>({ success: true, data: coupon }, { status: 201 });
  } catch (err) {
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No store found for this account' },
        { status: 403 },
      );
    }
    if (err instanceof DuplicateCouponCodeError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Coupon code already in use' }, { status: 409 });
    }
    throw err;
  }
}