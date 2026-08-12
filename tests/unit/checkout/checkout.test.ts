import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { calculateCartTotals } from '@/modules/cart/cart.service';

// ─── Address Schema (inline, mirrors Prisma + API surface) ───────────────────

const addressSchema = z.object({
  recipientName: z.string().min(1, 'Name is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit PIN'),
  country: z.string().default('India'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
});

// ─── Razorpay Order Payload Builder ──────────────────────────────────────────

function buildRazorpayPayload(totalRupees: number, currency = 'INR') {
  return {
    amountPaisa: Math.round(totalRupees * 100),
    currency,
  };
}

// ─── Coupon Discount Calculator ───────────────────────────────────────────────

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

function applyCouponDiscount(
  orderValue: number,
  discountType: DiscountType,
  discountValue: number,
  maxDiscountAmount?: number
): number {
  let discount = 0;
  if (discountType === 'PERCENTAGE') {
    discount = (orderValue * discountValue) / 100;
  } else {
    discount = discountValue;
  }
  if (maxDiscountAmount !== undefined) {
    discount = Math.min(discount, maxDiscountAmount);
  }
  return Math.min(discount, orderValue); // never exceed order value
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Address Schema Validation', () => {
  it('accepts a valid Indian address', () => {
    const result = addressSchema.safeParse({
      recipientName: 'Somnath Bhatia',
      line1: 'Flat 3B, Sunrise Apartments',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      phone: '9876543210',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing recipientName', () => {
    const result = addressSchema.safeParse({
      recipientName: '',
      line1: 'Some Street',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      phone: '9876543210',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('recipientName'))).toBe(true);
    }
  });

  it('rejects invalid PIN code (5 digits)', () => {
    const result = addressSchema.safeParse({
      recipientName: 'Test User',
      line1: '123 Street',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '40000',   // 5 digits — invalid
      phone: '9876543210',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('postalCode'))).toBe(true);
    }
  });

  it('rejects invalid phone number starting with 5', () => {
    const result = addressSchema.safeParse({
      recipientName: 'Test User',
      line1: '123 Street',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      phone: '5123456789',   // starts with 5 — invalid
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('phone'))).toBe(true);
    }
  });

  it('accepts line2 as optional', () => {
    const withLine2 = addressSchema.safeParse({
      recipientName: 'Test',
      line1: 'Line 1',
      line2: 'Near Park',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      phone: '6900000001',
    });
    expect(withLine2.success).toBe(true);

    const withoutLine2 = addressSchema.safeParse({
      recipientName: 'Test',
      line1: 'Line 1',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      phone: '6900000001',
    });
    expect(withoutLine2.success).toBe(true);
  });
});

describe('Razorpay Order Payload', () => {
  it('converts rupees to paisa correctly', () => {
    const { amountPaisa } = buildRazorpayPayload(3168);
    expect(amountPaisa).toBe(316800);
  });

  it('handles fractional rupee amounts by rounding', () => {
    const { amountPaisa } = buildRazorpayPayload(99.99);
    expect(amountPaisa).toBe(9999);
  });

  it('defaults to INR currency', () => {
    const { currency } = buildRazorpayPayload(500);
    expect(currency).toBe('INR');
  });

  it('returns zero paisa for zero rupee order', () => {
    expect(buildRazorpayPayload(0).amountPaisa).toBe(0);
  });
});

describe('Coupon Discount Logic', () => {
  it('applies percentage discount correctly', () => {
    // 10% off ₹1000 = ₹100
    expect(applyCouponDiscount(1000, 'PERCENTAGE', 10)).toBe(100);
  });

  it('applies fixed amount discount correctly', () => {
    expect(applyCouponDiscount(500, 'FIXED_AMOUNT', 75)).toBe(75);
  });

  it('caps percentage discount at maxDiscountAmount', () => {
    // 50% of ₹1000 = ₹500, but cap is ₹200
    expect(applyCouponDiscount(1000, 'PERCENTAGE', 50, 200)).toBe(200);
  });

  it('never exceeds the total order value for fixed discounts', () => {
    // Fixed ₹999 discount on ₹100 order
    expect(applyCouponDiscount(100, 'FIXED_AMOUNT', 999)).toBe(100);
  });

  it('handles 0% discount', () => {
    expect(applyCouponDiscount(500, 'PERCENTAGE', 0)).toBe(0);
  });
});

describe('Cart → Checkout Order Mapping', () => {
  it('maps multi-vendor cart to split sub-orders', () => {
    const items = [
      { productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', quantity: 1, price: 800, storeId: 'store-a', storeName: 'Alpha' },
      { productId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', quantity: 2, price: 300, storeId: 'store-b', storeName: 'Beta' },
    ];
    const result = calculateCartTotals(items);

    // Subtotal = 800 + 600 = 1400
    expect(result.subtotal).toBe(1400);
    expect(result.storeGroups.length).toBe(2);

    const alpha = result.storeGroups.find((g) => g.storeId === 'store-a');
    expect(alpha?.subtotal).toBe(800);
    expect(alpha?.items[0].quantity).toBe(1);

    const beta = result.storeGroups.find((g) => g.storeId === 'store-b');
    expect(beta?.subtotal).toBe(600);
    expect(beta?.items[0].quantity).toBe(2);
  });

  it('grand total after coupon discount is correct', () => {
    const items = [
      { productId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', quantity: 2, price: 500, storeId: 'store-a', storeName: 'A' },
    ];
    const { total } = calculateCartTotals(items);
    // subtotal=1000, tax=180, shipping=50 => total=1230
    expect(total).toBe(1230);

    // Apply ₹100 fixed coupon
    const discounted = Math.max(0, total - applyCouponDiscount(total, 'FIXED_AMOUNT', 100));
    expect(discounted).toBe(1130);
  });
});
