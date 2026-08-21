import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import { createCategory, InvalidParentCategoryError } from '@/modules/admin/categories.service';
import { listCategories } from '@/modules/categories/categories.service';
import { createCategorySchema } from '@/modules/admin/schemas';
import { listCategoriesQuerySchema } from '@/modules/categories/schemas';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['ADMIN']);
  if (isAuthError(auth)) return auth.error;

  const parsed = listCategoriesQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid query' },
      { status: 400 },
    );
  }

  const categories = await listCategories(parsed.data);
  return NextResponse.json<ApiResponse>({ success: true, data: categories });
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, ['ADMIN']);
  if (isAuthError(auth)) return auth.error;

  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const category = await createCategory(parsed.data);
    return NextResponse.json<ApiResponse>({ success: true, data: category }, { status: 201 });
  } catch (err) {
    if (err instanceof InvalidParentCategoryError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Parent category not found' }, { status: 400 });
    }
    throw err;
  }
}