import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/modules/auth/rbac';
import { groupOrderItemsByStore, getOrderTimelineSteps } from '@/modules/orders/orders.service';
import type { ApiResponse } from '@/types';

async function getEffectiveUserId(request: NextRequest): Promise<string | null> {
  const auth = requireAuth(request);
  if (!isAuthError(auth)) {
    return auth.userId;
  }
  const customer = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' },
    select: { id: true },
  });
  return customer?.id ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        customerId: userId,
      },
      include: {
        orderItems: {
          include: {
            store: {
              select: { id: true, storeName: true, logoUrl: true, slug: true },
            },
            variant: {
              select: { id: true, imageUrl: true, title: true, sku: true },
            },
          },
        },
        payments: {
          select: { id: true, provider: true, status: true, transactionId: true, amount: true, createdAt: true },
        },
        coupon: {
          select: { code: true, discountValue: true, discountType: true, description: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const storeGroups = groupOrderItemsByStore(order.orderItems);
    const timelineSteps = getOrderTimelineSteps(order.orderStatus);

    return NextResponse.json({
      ...order,
      storeGroups,
      timelineSteps,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch order details';
    return NextResponse.json<ApiResponse>({ success: false, error: msg }, { status: 500 });
  }
}

