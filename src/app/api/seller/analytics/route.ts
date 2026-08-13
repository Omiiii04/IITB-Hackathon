import { NextRequest, NextResponse } from 'next/server';
import { requireRole, isAuthError, getOwnStoreId } from '@/modules/auth/rbac';
import { prisma } from '@/lib/prisma';
import { getDailySalesTrend, getTopProducts } from '@/modules/analytics/seller-analytics.service';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['SELLER']);
  if (isAuthError(auth)) return auth.error;

  const storeId = await getOwnStoreId(auth.userId);
  if (!storeId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'No store found. Create your store first.' },
      { status: 404 },
    );
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalOrders, recentOrders, totalProducts, totalVariants, pendingOrders, dailySales, topProducts] =
    await Promise.all([
      prisma.orderItem.count({ where: { storeId } }),
      prisma.orderItem.findMany({
        where: { storeId, createdAt: { gte: thirtyDaysAgo } },
        select: { totalPrice: true, subOrderStatus: true, createdAt: true },
      }),
      prisma.product.count({ where: { storeId, isActive: true } }),
      prisma.productVariant.count({ where: { storeId, isActive: true } }),
      prisma.orderItem.count({ where: { storeId, subOrderStatus: 'PLACED' } }),
      getDailySalesTrend(storeId),
      getTopProducts(storeId),
    ]);

  const revenueThisMonth = recentOrders.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
  const ordersThisMonth = recentOrders.length;

  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      totalOrders,
      ordersThisMonth,
      revenueThisMonth,
      totalProducts,
      totalVariants,
      pendingOrders,
      dailySales,
      topProducts,
    },
  });
}