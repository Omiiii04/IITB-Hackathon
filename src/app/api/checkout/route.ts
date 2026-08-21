import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/modules/auth/rbac';
import { CheckoutService } from '@/modules/checkout/checkout.service';
import { createCheckoutInputSchema } from '@/modules/checkout/schemas';
import { InsufficientStockError } from '@/modules/inventory/schemas';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

async function getEffectiveUserId(request: NextRequest): Promise<string | null> {
  const auth = requireAuth(request);
  if (!isAuthError(auth)) {
    return auth.userId;
  }
  // Fallback demo support: get first customer account if not logged in
  const customer = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' },
    select: { id: true },
  });
  return customer?.id ?? null;
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Checkout & Stock Reservation API',
    endpoint: '/api/checkout',
  });
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to initiate checkout' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createCheckoutInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const checkoutData = await CheckoutService.createCheckoutOrder(userId, parseResult.data);

    return NextResponse.json({
      success: true,
      data: checkoutData,
    });
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      logger.warn('Checkout failed due to insufficient stock', {
        variantId: error.variantId,
        available: error.availableStock,
        requested: error.requestedQuantity,
      });

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'INSUFFICIENT_STOCK',
          variantId: error.variantId,
          availableStock: error.availableStock,
        },
        { status: 409 }
      );
    }

    logger.error('Unhandled checkout error', { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal checkout processing error',
      },
      { status: 500 }
    );
  }
}
