import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import { listMySubOrders, NoStoreError } from '@/modules/orders/fulfillment.service';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  try {
    const orders = await listMySubOrders(auth.userId);
    return NextResponse.json<ApiResponse>({ success: true, data: orders });
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