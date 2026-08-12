import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/modules/auth/rbac';
import { addressInputSchema } from '@/modules/account/schemas';
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

    const addresses = await prisma.address.findMany({
      where: { customerId: userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch addresses';
    return NextResponse.json<ApiResponse>({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = addressInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Validation failed', message: parsed.error.issues[0]?.message },
        { status: 422 }
      );
    }

    const addressData = parsed.data;

    // Check existing address count for user
    const existingCount = await prisma.address.count({ where: { customerId: userId } });
    const shouldBeDefault = addressData.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { customerId: userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        customerId: userId,
        recipientName: addressData.recipientName,
        line1: addressData.line1,
        line2: addressData.line2 ?? null,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country || 'India',
        phone: addressData.phone,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create address';
    return NextResponse.json<ApiResponse>({ success: false, error: msg }, { status: 500 });
  }
}

