import { prisma } from '@/lib/prisma';

export async function getPlatformMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalStores, pendingStores, totalOrders, recentOrders, totalUsers] = await Promise.all([
    prisma.store.count({ where: { status: 'APPROVED' } }),
    prisma.store.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { orderStatus: { notIn: ['AWAITING_PAYMENT', 'PAYMENT_FAILED'] } } }),
    prisma.order.findMany({
      where: {
        orderStatus: { notIn: ['AWAITING_PAYMENT', 'PAYMENT_FAILED'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { totalAmount: true },
    }),
    prisma.user.count(),
  ]);

  const gmvThisMonth = recentOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    totalStores,
    pendingStores,
    totalOrders,
    gmvThisMonth,
    totalUsers,
  };
}

export async function getGmvBySellerStore(limit = 10) {
  const stores = await prisma.store.findMany({
    where: { status: 'APPROVED' },
    select: {
      id: true,
      storeName: true,
      commissionRate: true,
      orderItems: {
        where: { order: { orderStatus: { notIn: ['AWAITING_PAYMENT', 'PAYMENT_FAILED'] } } },
        select: { totalPrice: true },
      },
    },
  });

  return stores
    .map((store) => {
      const gmv = store.orderItems.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
      return {
        storeId: store.id,
        storeName: store.storeName,
        gmv,
        estimatedEarnings: gmv * (1 - store.commissionRate),
      };
    })
    .sort((a, b) => b.gmv - a.gmv)
    .slice(0, limit);
}