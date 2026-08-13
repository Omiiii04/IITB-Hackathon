import { prisma } from '@/lib/prisma';

export async function getDailySalesTrend(storeId: string, days = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const items = await prisma.orderItem.findMany({
    where: { storeId, createdAt: { gte: since } },
    select: { totalPrice: true, createdAt: true },
  });

  const byDay = new Map<string, number>();
  for (const item of items) {
    const day = item.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + (item.totalPrice ?? 0));
  }

  return Array.from(byDay.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTopProducts(storeId: string, limit = 5) {
  const items = await prisma.orderItem.findMany({
    where: { storeId },
    select: { productTitleSnapshot: true, quantity: true, totalPrice: true },
  });

  const byProduct = new Map<string, { quantity: number; revenue: number }>();
  for (const item of items) {
    const key = item.productTitleSnapshot;
    const existing = byProduct.get(key) ?? { quantity: 0, revenue: 0 };
    existing.quantity += item.quantity;
    existing.revenue += item.totalPrice ?? 0;
    byProduct.set(key, existing);
  }

  return Array.from(byProduct.entries())
    .map(([productTitle, stats]) => ({ productTitle, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}