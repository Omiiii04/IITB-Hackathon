import { prisma } from '@/lib/prisma';
import type { CreateStoreInput, UpdateStoreInput } from './schemas';

export class StoreAlreadyExistsError extends Error {}
export class StoreNotFoundError extends Error {}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function generateUniqueSlug(storeName: string): Promise<string> {
  const base = slugify(storeName);
  const existing = await prisma.store.findUnique({ where: { slug: base }, select: { id: true } });
  if (!existing) return base;

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function createStore(userId: string, input: CreateStoreInput) {
  const existing = await prisma.store.findUnique({ where: { sellerId: userId }, select: { id: true } });
  if (existing) throw new StoreAlreadyExistsError();

  const slug = await generateUniqueSlug(input.storeName);

  return prisma.store.create({
    data: {
      sellerId: userId,
      storeName: input.storeName,
      slug,
      description: input.description,
      logoUrl: input.logoUrl,
      bannerUrl: input.bannerUrl,
    },
  });
}

export async function getMyStore(userId: string) {
  return prisma.store.findUnique({ where: { sellerId: userId } });
}

export async function updateStore(userId: string, input: UpdateStoreInput) {
  const store = await getMyStore(userId);
  if (!store) throw new StoreNotFoundError();

  return prisma.store.update({ where: { id: store.id }, data: input });
}