import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import {
  advanceSubOrderStatus,
  NoStoreError,
  SubOrderNotFoundError,
  InvalidTransitionError,
} from '@/modules/orders/fulfillment.service';
import type { ApiResponse } from '@/types';

const bodySchema = z.object({
  status: z.enum(['SELLER_ACCEPTED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY']),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid status' },
      { status: 400 },
    );
  }

  try {
    const subOrder = await advanceSubOrderStatus(auth.userId, id, parsed.data.status);
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
    if (err instanceof InvalidTransitionError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cannot move to that status from the current state' },
        { status: 409 },
      );
    }
    throw err;
  }
}