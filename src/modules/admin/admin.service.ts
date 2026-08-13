import { prisma } from '@/lib/prisma';
import type { UpdateStoreStatusInput } from './schemas';

export class StoreNotFoundError extends Error {}

export async function listStoresByStatus(status?: 'PENDING' | 'APPROVED' | 'SUSPENDED') {
  return prisma.store.findMany({
    where: status ? { status } : undefined,
    include: { seller: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function updateStoreStatus(storeId: string, input: UpdateStoreStatusInput) {
  const result = await prisma.store.updateMany({
    where: { id: storeId },
    data: { status: input.status },
  });

  if (result.count === 0) throw new StoreNotFoundError();

  return prisma.store.findUnique({
    where: { id: storeId },
    include: { seller: { select: { id: true, name: true, email: true } } },
  });
}