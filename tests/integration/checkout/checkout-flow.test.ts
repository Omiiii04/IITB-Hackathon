import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckoutService } from '@/modules/checkout/checkout.service';
import { prisma } from '@/lib/prisma';
import * as razorpayProvider from '@/modules/payments/razorpay.provider';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      productVariant: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      coupon: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      order: {
        create: vi.fn(),
      },
      payment: {
        create: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prisma)),
    },
  };
});

vi.mock('@/modules/payments/razorpay.provider', () => ({
  createRazorpayOrder: vi.fn(),
}));

describe('CheckoutService - End-to-End Checkout Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates totals, creates master order, reserves stock, and initializes Razorpay order', async () => {
    const mockVariants = [
      {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        productId: 'prod-1',
        storeId: 'store-1',
        title: 'Blue M',
        variantPrice: 499.0,
        stock: 20,
        reservedStock: 0,
        attributes: { size: 'M', color: 'Blue' },
        isActive: true,
        product: { title: 'Premium Cotton T-Shirt', isActive: true },
        store: { id: 'store-1', storeName: 'Apparel Hub', status: 'APPROVED' },
      },
    ];

    vi.mocked(prisma.productVariant.findMany).mockResolvedValueOnce(mockVariants as any);
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValueOnce(mockVariants[0] as any);
    vi.mocked(prisma.productVariant.update).mockResolvedValueOnce({} as any);

    vi.mocked(prisma.order.create).mockResolvedValueOnce({
      id: 'order-uuid-1234',
      orderNumber: 'ORD-TEST-001',
      totalAmount: 573.95,
    } as any);

    vi.mocked(razorpayProvider.createRazorpayOrder).mockResolvedValueOnce({
      id: 'order_rzp_mock_123',
      amount: 57395,
      currency: 'INR',
      receipt: 'orderuuid1234',
      status: 'created',
      createdAt: Date.now(),
      entity: 'order',
    });

    vi.mocked(prisma.payment.create).mockResolvedValueOnce({} as any);

    const result = await CheckoutService.createCheckoutOrder('cust-1', {
      items: [{ variantId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', quantity: 1 }],
      shippingAddress: {
        recipientName: 'Rahul Verma',
        line1: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        phone: '9876543210',
        country: 'India',
      },
    });

    expect(result).toBeDefined();
    expect(result.orderId).toBe('order-uuid-1234');
    expect(result.razorpayOrderId).toBe('order_rzp_mock_123');
    expect(result.currency).toBe('INR');
    expect(prisma.order.create).toHaveBeenCalled();
    expect(prisma.payment.create).toHaveBeenCalled();
  });
});
