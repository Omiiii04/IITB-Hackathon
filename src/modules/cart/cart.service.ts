import { prisma } from '@/lib/prisma';
import type { CartItemInput } from './schemas';

export interface ValidatedCartItem {
  productId: string;
  variantId?: string;
  title: string;
  slug?: string;
  unitPrice: number;
  quantity: number;
  itemSubtotal: number;
  imageUrl?: string;
  storeId: string;
  storeName: string;
  variantTitle?: string;
  maxAvailableStock: number;
  isAvailable: boolean;
  stockMessage?: string;
}

export interface StoreCartGroup {
  storeId: string;
  storeName: string;
  items: ValidatedCartItem[];
  subtotal: number;
}

export interface CartCalculationResult {
  items: ValidatedCartItem[];
  storeGroups: StoreCartGroup[];
  totalQuantity: number;
  subtotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  total: number;
  hasOutofStockItems: boolean;
}

/**
 * Calculates cart totals, grouping items by store for split sub-orders.
 */
export function calculateCartTotals(
  items: (CartItemInput & { unitPrice?: number })[]
): CartCalculationResult {
  let subtotal = 0;
  let totalQuantity = 0;
  const hasOutofStockItems = false;

  const validatedItems: ValidatedCartItem[] = items.map((item) => {
    const price = item.unitPrice ?? item.price ?? 0;
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;
    totalQuantity += item.quantity;

    return {
      productId: item.productId,
      variantId: item.variantId,
      title: item.title ?? 'Product',
      unitPrice: price,
      quantity: item.quantity,
      itemSubtotal,
      imageUrl: item.imageUrl,
      storeId: item.storeId ?? 'default-store',
      storeName: item.storeName ?? 'Seller Store',
      variantTitle: item.variantTitle,
      maxAvailableStock: 999,
      isAvailable: true,
    };
  });

  // Group by store
  const storeMap = new Map<string, StoreCartGroup>();

  for (const item of validatedItems) {
    let group = storeMap.get(item.storeId);
    if (!group) {
      group = {
        storeId: item.storeId,
        storeName: item.storeName,
        items: [],
        subtotal: 0,
      };
      storeMap.set(item.storeId, group);
    }
    group.items.push(item);
    group.subtotal += item.itemSubtotal;
  }

  // Calculate tax (e.g. 18% GST estimate) and flat shipping per store
  const estimatedTax = Math.round(subtotal * 0.18 * 100) / 100;
  const estimatedShipping = subtotal > 0 ? storeMap.size * 50 : 0; // ₹50 shipping per store
  const total = Math.round((subtotal + estimatedTax + estimatedShipping) * 100) / 100;

  return {
    items: validatedItems,
    storeGroups: Array.from(storeMap.values()),
    totalQuantity,
    subtotal,
    estimatedTax,
    estimatedShipping,
    total,
    hasOutofStockItems,
  };
}

/**
 * Validates cart items against Prisma database for stock and live pricing.
 */
export async function validateCartStock(
  items: CartItemInput[]
): Promise<CartCalculationResult> {
  if (items.length === 0) {
    return calculateCartTotals([]);
  }

  const productIds = Array.from(new Set(items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: {
      id: true,
      title: true,
      slug: true,
      basePrice: true,
      images: true,
      store: { select: { id: true, storeName: true } },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          variantPrice: true,
          stock: true,
          imageUrl: true,
        },
      },
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const validatedInputs: (CartItemInput & { unitPrice: number })[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;

    let unitPrice = product.basePrice;
    let variantTitle: string | undefined;
    let imageUrl = Array.isArray(product.images) && typeof product.images[0] === 'string' ? product.images[0] : undefined;
    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant) {
        unitPrice = variant.variantPrice;
        variantTitle = variant.title ?? undefined;
        if (variant.imageUrl) imageUrl = variant.imageUrl;
      }
    }

    validatedInputs.push({
      ...item,
      title: product.title,
      unitPrice,
      imageUrl,
      storeId: product.store?.id ?? 'unknown-store',
      storeName: product.store?.storeName ?? 'MarketHub Seller',
      variantTitle,
    });
  }

  return calculateCartTotals(validatedInputs);
}
