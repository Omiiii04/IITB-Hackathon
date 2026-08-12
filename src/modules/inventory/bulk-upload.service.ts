import Papa from 'papaparse';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getOwnStoreId } from '@/modules/auth/rbac';
import {
  addVariant,
  updateVariant,
  NoStoreError,
  ProductNotFoundError,
  DuplicateSkuError,
} from '@/modules/products/variant.service';


const bulkUploadRowSchema = z.object({
  sku: z.string().trim().min(1, 'sku is required'),
  title: z.string().trim().max(100).optional(),
  variantPrice: z.coerce.number().positive('variantPrice must be a positive number'),
  stock: z.coerce.number().int().min(0, 'stock must be 0 or greater'),
  attributes: z
    .string()
    .transform((raw, ctx) => {
      try {
        return JSON.parse(raw) as Record<string, string>;
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'attributes must be valid JSON' });
        return z.NEVER;
      }
    }),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export type BulkUploadRow = z.infer<typeof bulkUploadRowSchema>;

export interface BulkUploadRowResult {
  row: number; // 1-indexed, matches the CSV line the seller sees in a spreadsheet
  sku?: string;
  action?: 'created' | 'updated';
  success: boolean;
  error?: string;
}

export interface BulkUploadSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkUploadRowResult[];
}

export class EmptyCsvError extends Error {}

export function parseBulkUploadCsv(rawCsv: string): Record<string, string>[] {
  const parsed = Papa.parse<Record<string, string>>(rawCsv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (!parsed.data.length) {
    throw new EmptyCsvError();
  }

  return parsed.data;
}

export async function processBulkUpload(
  userId: string,
  productId: string,
  rawCsv: string,
): Promise<BulkUploadSummary> {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const product = await prisma.product.findFirst({
    where: { id: productId, storeId, isActive: true },
    select: { id: true },
  });
  if (!product) throw new ProductNotFoundError();

  const rawRows = parseBulkUploadCsv(rawCsv);
  const results: BulkUploadRowResult[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 1;
    const rawRow = rawRows[i];

    const parsed = bulkUploadRowSchema.safeParse(rawRow);
    if (!parsed.success) {
      results.push({
        row: rowNumber,
        sku: rawRow.sku,
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid row',
      });
      continue;
    }

    const { sku, title, variantPrice, stock, attributes, imageUrl } = parsed.data;

    try {
      const existing = await prisma.productVariant.findFirst({
        where: { sku, productId, storeId },
        select: { id: true },
      });

      if (existing) {
        await updateVariant(userId, existing.id, {
          title,
          variantPrice,
          stock,
          attributes,
          imageUrl: imageUrl || undefined,
        });
        results.push({ row: rowNumber, sku, action: 'updated', success: true });
      } else {
        await addVariant(userId, productId, {
          sku,
          title,
          variantPrice,
          stock,
          attributes,
          imageUrl: imageUrl || undefined,
        });
        results.push({ row: rowNumber, sku, action: 'created', success: true });
      }
    } catch (err) {
      const message =
        err instanceof DuplicateSkuError
          ? 'sku already in use by another product'
          : err instanceof Error
            ? err.message
            : 'Unknown error';
      results.push({ row: rowNumber, sku, success: false, error: message });
    }
  }

  return {
    total: results.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}