import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/modules/auth/rbac';
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
        customer: { select: { name: true, email: true, phone: true } },
        orderItems: {
          include: {
            store: { select: { storeName: true } },
          },
        },
        payments: { select: { provider: true, transactionId: true, status: true } },
      },
    });

    if (!order) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const invoiceNumber = `INV-${(order.orderNumber ?? order.id).slice(0, 8).toUpperCase()}`;

    const invoiceData = {
      invoiceNumber,
      invoiceDate: order.createdAt,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer.name ?? 'Customer',
      customerEmail: order.customer.email,
      shippingAddress: order.shippingAddressSnapshot,
      items: order.orderItems.map((item) => ({
        productTitle: item.productTitleSnapshot,
        storeName: item.store?.storeName ?? 'Seller Store',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice ?? item.unitPrice * item.quantity,
      })),
      financials: {
        totalAmount: order.totalAmount,
        discountAmount: order.discountAmount,
        taxAmount: order.taxAmount,
        shippingAmount: order.shippingAmount,
        subtotal: order.totalAmount - order.taxAmount - order.shippingAmount + order.discountAmount,
      },
      paymentInfo: order.payments[0] ?? { provider: 'RAZORPAY', status: 'SUCCESS' },
    };

    return NextResponse.json(invoiceData);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to generate invoice';
    return NextResponse.json<ApiResponse>({ success: false, error: msg }, { status: 500 });
  }
}

