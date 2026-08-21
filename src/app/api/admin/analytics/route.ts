import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import { getPlatformMetrics, getGmvBySellerStore } from '@/modules/analytics/admin-analytics.service';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['ADMIN']);
  if (isAuthError(auth)) return auth.error;

  const [platform, topStores] = await Promise.all([getPlatformMetrics(), getGmvBySellerStore()]);

  return NextResponse.json<ApiResponse>({ success: true, data: { platform, topStores } });
}