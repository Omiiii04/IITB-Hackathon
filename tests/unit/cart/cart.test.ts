import { describe, it, expect } from 'vitest';
import { calculateCartTotals } from '@/modules/cart/cart.service';
import { cartItemSchema, addToCartSchema, updateCartItemSchema } from '@/modules/cart/schemas';

describe('Cart Schemas Unit Tests', () => {
  it('validates a valid cart item input', () => {
    const input = {
      productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      quantity: 2,
      price: 499,
      title: 'Test Product',
    };

    const parsed = cartItemSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid quantities or invalid UUIDs', () => {
    const invalidUuid = {
      productId: 'invalid-uuid',
      quantity: 1,
    };
    expect(cartItemSchema.safeParse(invalidUuid).success).toBe(false);

    const zeroQuantity = {
      productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      quantity: 0,
    };
    expect(addToCartSchema.safeParse(zeroQuantity).success).toBe(false);
  });
});

describe('Cart Service Unit Tests', () => {
  it('calculates subtotal, tax, shipping, and total for empty items', () => {
    const result = calculateCartTotals([]);
    expect(result.subtotal).toBe(0);
    expect(result.totalQuantity).toBe(0);
    expect(result.estimatedShipping).toBe(0);
    expect(result.total).toBe(0);
    expect(result.storeGroups.length).toBe(0);
  });

  it('groups items by store for split multi-vendor sub-orders', () => {
    const items = [
      {
        productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        quantity: 2,
        price: 500,
        storeId: 'store-1',
        storeName: 'Alpha Store',
      },
      {
        productId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        quantity: 1,
        price: 1000,
        storeId: 'store-1',
        storeName: 'Alpha Store',
      },
      {
        productId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        quantity: 3,
        price: 200,
        storeId: 'store-2',
        storeName: 'Beta Store',
      },
    ];

    const result = calculateCartTotals(items);

    // Subtotal = (2*500) + (1*1000) + (3*200) = 1000 + 1000 + 600 = 2600
    expect(result.subtotal).toBe(2600);
    expect(result.totalQuantity).toBe(6);

    // Store groupings: 2 distinct stores
    expect(result.storeGroups.length).toBe(2);

    const store1 = result.storeGroups.find((g) => g.storeId === 'store-1');
    expect(store1).toBeDefined();
    expect(store1?.subtotal).toBe(2000);
    expect(store1?.items.length).toBe(2);

    const store2 = result.storeGroups.find((g) => g.storeId === 'store-2');
    expect(store2).toBeDefined();
    expect(store2?.subtotal).toBe(600);
    expect(store2?.items.length).toBe(1);

    // Shipping is ₹50 per store => ₹100
    expect(result.estimatedShipping).toBe(100);

    // Tax = 18% of 2600 = 468
    expect(result.estimatedTax).toBe(468);

    // Total = 2600 + 468 + 100 = 3168
    expect(result.total).toBe(3168);
  });
});
