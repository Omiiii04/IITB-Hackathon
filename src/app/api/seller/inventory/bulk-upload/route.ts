import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import { processBulkUpload, EmptyCsvError } from '@/modules/inventory/bulk-upload.service';
import { NoStoreError, ProductNotFoundError } from '@/modules/products/variant.service';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Expected multipart/form-data with file and productId' },
      { status: 400 },
    );
  }

  const productId = formData.get('productId');
  const file = formData.get('file');

  if (typeof productId !== 'string' || !productId) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'productId is required' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'CSV file is required' }, { status: 400 });
  }

  const rawCsv = await file.text();

  try {
    const summary = await processBulkUpload(auth.userId, productId, rawCsv);

    logger.info('Bulk inventory upload completed', {
      userId: auth.userId,
      productId,
      total: summary.total,
      succeeded: summary.succeeded,
      failed: summary.failed,
    });

    return NextResponse.json<ApiResponse>({ success: true, data: summary });
  } catch (err) {
    if (err instanceof EmptyCsvError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'CSV file has no rows' }, { status: 400 });
    }
    if (err instanceof NoStoreError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'No store found for this account' }, { status: 403 });
    }
    if (err instanceof ProductNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Product not found' }, { status: 404 });
    }

    logger.error('Bulk inventory upload failed unexpectedly', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}