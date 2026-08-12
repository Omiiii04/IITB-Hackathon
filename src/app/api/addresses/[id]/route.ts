import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth, isAuthError } from '@/modules/auth/rbac';
import type { ApiResponse } from '@/types';

const updateAddressSchema = z.object({
  recipientName: z.string().trim().min(1).optional(),
  line1: z.string().trim().min(1).optional(),
  line2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
  postalCode: z.string().trim().min(1).optional(),
  country: z.string().trim().optional(),
  phone: z.string().trim().min(1).optional(),
  isDefault: z.boolean().optional(),
});

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

    const address = await prisma.address.findFirst({
      where: { id, customerId: userId },
    });

    if (!address) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch address';
    return NextResponse.json<ApiResponse>({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}

async function handleUpdate(
  request: NextRequest,
  paramsPromise: Promise<{ id: string }>
) {
  try {
    const { id } = await paramsPromise;
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.address.findFirst({
      where: { id, customerId: userId },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Address not found' }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = updateAddressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Validation failed', message: parsed.error.issues[0]?.message },
        { status: 422 }
      );
    }

    const data = parsed.data;

    if (data.isDefault === true) {
      await prisma.address.updateMany({
        where: { customerId: userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        ...(data.recipientName !== undefined && { recipientName: data.recipientName }),
        ...(data.line1 !== undefined && { line1: data.line1 }),
        ...(data.line2 !== undefined && { line2: data.line2 }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update address';
    return NextResponse.json<ApiResponse>({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getEffectiveUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.address.findFirst({
      where: { id, customerId: userId },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Address not found' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    // If deleted address was default, promote another address to default if available
    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { customerId: userId },
        orderBy: { createdAt: 'desc' },
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to delete address';
    return NextResponse.json<ApiResponse>({ success: false, error: msg }, { status: 500 });
  }
}

