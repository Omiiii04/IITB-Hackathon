// GET /api/products/[id] — public single-product detail.
// Accepts either a UUID (product id) or a slug (human-readable URL segment).
// No authentication required.

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getProductById, getProductBySlug } from '@/modules/products/products.service';
import type { ApiResponse } from '@/types';

// UUID v4 pattern — used to decide whether the segment is an id or a slug.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || id.trim() === '') {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Product id or slug is required' },
      { status: 400 },
    );
  }

  try {
    const product = UUID_RE.test(id)
      ? await getProductById(id)
      : await getProductBySlug(id);

    if (!product) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<typeof product>>(
      { success: true, data: product },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      },
    );
  } catch (err) {
    logger.error('GET /api/products/[id] failed', { id, err });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 },
    );
  }
}
