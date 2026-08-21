import { prisma } from '@/lib/prisma';
import type { UpdateStoreStatusInput, ListUsersQuery } from './schemas';

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

const USER_LIST_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isEmailVerified: true,
  createdAt: true,
} as const;

export async function listUsers(query: ListUsersQuery) {
  const { q, role, page, limit } = query;

  const where = {
    ...(role && { role }),
    ...(q && {
      OR: [
        { email: { contains: q, mode: 'insensitive' as const } },
        { name: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: USER_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}