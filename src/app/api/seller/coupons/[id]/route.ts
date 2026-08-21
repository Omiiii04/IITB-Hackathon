import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import { deleteCoupon, NoStoreError, CouponNotFoundError } from '@/modules/coupons/coupons.service';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;

  try {
    await deleteCoupon(auth.userId, id);
    return NextResponse.json<ApiResponse>({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No store found for this account' },
        { status: 403 },
      );
    }
    if (err instanceof CouponNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Coupon not found' }, { status: 404 });
    }
    throw err;
  }
}