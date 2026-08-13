import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import {
  verifyDeliveryOtp,
  NoStoreError,
  SubOrderNotFoundError,
  InvalidOtpError,
} from '@/modules/orders/fulfillment.service';
import type { ApiResponse } from '@/types';

const bodySchema = z.object({
  otp: z.string().trim().length(6),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'A 6-digit OTP is required' }, { status: 400 });
  }

  try {
    const subOrder = await verifyDeliveryOtp(auth.userId, id, parsed.data.otp);
    return NextResponse.json<ApiResponse>({ success: true, data: subOrder });
  } catch (err) {
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No store found for this account' },
        { status: 403 },
      );
    }
    if (err instanceof SubOrderNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Sub-order not found' }, { status: 404 });
    }
    if (err instanceof InvalidOtpError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Incorrect OTP' }, { status: 400 });
    }
    throw err;
  }
}