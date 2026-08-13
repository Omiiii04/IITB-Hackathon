import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import { updateStoreStatus, StoreNotFoundError } from '@/modules/admin/admin.service';
import { updateStoreStatusSchema } from '@/modules/admin/schemas';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['ADMIN']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;

  const body = await request.json();
  const parsed = updateStoreStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const store = await updateStoreStatus(id, parsed.data);

    logger.info('Store status updated by admin', {
      adminId: auth.userId,
      storeId: id,
      newStatus: parsed.data.status,
      reason: parsed.data.reason,
    });

    return NextResponse.json<ApiResponse>({ success: true, data: store });
  } catch (err) {
    if (err instanceof StoreNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Store not found' }, { status: 404 });
    }
    throw err;
  }
}