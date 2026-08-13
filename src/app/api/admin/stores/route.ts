import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import { listStoresByStatus } from '@/modules/admin/admin.service';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['ADMIN']);
  if (isAuthError(auth)) return auth.error;

  const statusParam = request.nextUrl.searchParams.get('status');
  const status =
    statusParam === 'PENDING' || statusParam === 'APPROVED' || statusParam === 'SUSPENDED'
      ? statusParam
      : undefined;

  const stores = await listStoresByStatus(status);
  return NextResponse.json<ApiResponse>({ success: true, data: stores });
}