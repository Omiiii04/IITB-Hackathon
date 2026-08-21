import { prisma } from '@/lib/prisma';
import type { CreateCategoryInput, UpdateCategoryInput } from './schemas';

export class CategoryNotFoundError extends Error {}
export class InvalidParentCategoryError extends Error {}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug: base }, select: { id: true } });
  if (!existing) return base;

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

async function assertParentExists(parentCategoryId: string) {
  const parent = await prisma.category.findUnique({ where: { id: parentCategoryId }, select: { id: true } });
  if (!parent) throw new InvalidParentCategoryError();
}

export async function createCategory(input: CreateCategoryInput) {
  if (input.parentCategoryId) {
    await assertParentExists(input.parentCategoryId);
  }

  const slug = await generateUniqueSlug(input.name);

  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl,
      parentCategoryId: input.parentCategoryId,
    },
  });
}

export async function updateCategory(categoryId: string, input: UpdateCategoryInput) {
  if (input.parentCategoryId) {
    if (input.parentCategoryId === categoryId) {
      throw new InvalidParentCategoryError();
    }
    await assertParentExists(input.parentCategoryId);
  }

  const result = await prisma.category.updateMany({
    where: { id: categoryId },
    data: input,
  });

  if (result.count === 0) throw new CategoryNotFoundError();
  return prisma.category.findUnique({ where: { id: categoryId } });
}

export async function deactivateCategory(categoryId: string) {
  const result = await prisma.category.updateMany({
    where: { id: categoryId },
    data: { isActive: false },
  });

  if (result.count === 0) throw new CategoryNotFoundError();
}