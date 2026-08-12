// GET /api/categories — public category tree listing.
// No authentication required.
// By default returns top-level (root) active categories.
// Pass ?parentId=<uuid> to fetch direct children of a category.
// Pass ?withChildren=true to include one level of nested sub-categories.

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { listCategoriesQuerySchema } from '@/modules/categories/schemas';
import { listCategories } from '@/modules/categories/categories.service';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = listCategoriesQuerySchema.safeParse(rawParams);

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
    const categories = await listCategories(parsed.data);
    return NextResponse.json<ApiResponse<typeof categories>>(
      { success: true, data: categories },
      {
        status: 200,
        headers: {
          // Categories change infrequently — cache aggressively.
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        },
      },
    );
  } catch (err) {
    logger.error('GET /api/categories failed', err);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 },
    );
  }
}
