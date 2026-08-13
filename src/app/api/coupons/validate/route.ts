import { NextRequest, NextResponse } from 'next/server';
import { validateCouponForStore, CouponInvalidError } from '@/modules/coupons/coupons.service';
import { validateCouponSchema } from '@/modules/coupons/schemas';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = validateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const result = await validateCouponForStore(parsed.data.code, parsed.data.storeId, parsed.data.cartTotal);
    return NextResponse.json<ApiResponse>({ success: true, data: result });
  } catch (err) {
    if (err instanceof CouponInvalidError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Coupon is invalid or expired' }, { status: 400 });
    }
    throw err;
  }
}