import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError } from '@/modules/auth/rbac';
import {
  updateCategory,
  deactivateCategory,
  CategoryNotFoundError,
  InvalidParentCategoryError,
} from '@/modules/admin/categories.service';
import { updateCategorySchema } from '@/modules/admin/schemas';
import type { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['ADMIN']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    );
  }

  try {
    const category = await updateCategory(id, parsed.data);
    return NextResponse.json<ApiResponse>({ success: true, data: category });
  } catch (err) {
    if (err instanceof CategoryNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Category not found' }, { status: 404 });
    }
    if (err instanceof InvalidParentCategoryError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid parent category' }, { status: 400 });
    }
    throw err;
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = requireRole(request, ['ADMIN']);
  if (isAuthError(auth)) return auth.error;

  const { id } = await params;

  try {
    await deactivateCategory(id);
    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (err) {
    if (err instanceof CategoryNotFoundError) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Category not found' }, { status: 404 });
    }
    throw err;
  }
}