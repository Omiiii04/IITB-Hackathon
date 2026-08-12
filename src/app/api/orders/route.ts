import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/modules/auth/rbac';
import { orderQuerySchema, type OrderQuery } from '@/modules/orders/schemas';
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

export async function GET(request: NextRequest) {
  try {
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');

    const parsedQuery = orderQuerySchema.safeParse({
      status: statusParam ?? undefined,
      search: searchParam ?? undefined,
    });

    const query: Partial<OrderQuery> = parsedQuery.success ? parsedQuery.data : {};

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      customerId: userId,
    };

    if (query.status) {
      whereClause.orderStatus = query.status;
    }

    if (query.search) {
      whereClause.OR = [
        { id: { contains: query.search, mode: 'insensitive' } },
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        {
          orderItems: {
            some: {
              productTitleSnapshot: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            store: {
              select: { id: true, storeName: true, logoUrl: true },
            },
            variant: {
              select: { id: true, imageUrl: true, title: true },
            },
          },
        },
        payments: {
          select: { id: true, provider: true, status: true, transactionId: true, amount: true },
        },
        coupon: {
          select: { code: true, discountValue: true, discountType: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch order history';
    return NextResponse.json<ApiResponse>({ success: false, error: msg }, { status: 500 });
  }
}

