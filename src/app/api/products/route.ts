// GET /api/products — public product catalogue listing.
// No authentication required. Supports pagination, filtering, and sorting.

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { listProductsQuerySchema } from '@/modules/products/schemas';
import { listProducts } from '@/modules/products/products.service';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  // Parse and validate query-string params
  const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listProductsQuerySchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Invalid query parameters',
        message: parsed.error.issues[0]?.message,
      },
      { status: 422 },
    );
  }

  try {
    const result = await listProducts(parsed.data);
    return NextResponse.json<ApiResponse<typeof result>>(
      { success: true, data: result },
      {
        status: 200,
        headers: {
          // Allow CDN / browser to cache the public listing briefly.
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      },
    );
  } catch (err) {
    logger.error('GET /api/products failed', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}
