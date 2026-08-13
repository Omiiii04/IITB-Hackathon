import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  advanceSubOrderStatus,
  verifyDeliveryOtp,
  listMySubOrders,
  InvalidOtpError,
  InvalidTransitionError,
} from '@/modules/orders/fulfillment.service';
import { prisma } from '@/lib/prisma';
import * as rbac from '@/modules/auth/rbac';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    orderItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    order: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock('@/modules/auth/rbac', () => ({
  getOwnStoreId: vi.fn(),
}));

describe('Seller Order Fulfillment & OTP Handshake', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rbac.getOwnStoreId).mockResolvedValue('store-123');
  });

  it('lists sub-orders scoped strictly to the authenticated seller store', async () => {
    vi.mocked(prisma.orderItem.findMany).mockResolvedValueOnce([
      {
        id: 'item-1',
        subOrderStatus: 'PLACED',
        productTitleSnapshot: 'Cotton Hoodie',
        quantity: 1,
        totalPrice: 1299.0,
        createdAt: new Date(),
        order: { orderNumber: 'ORD-001' },
      },
    ] as any);

    const orders = await listMySubOrders('seller-user-1');

    expect(orders).toHaveLength(1);
    expect(orders[0].productTitleSnapshot).toBe('Cotton Hoodie');
    expect(prisma.orderItem.findMany).toHaveBeenCalledWith({
      where: { storeId: 'store-123' },
      include: { order: { select: { orderNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('advances sub-order status through the lifecycle step-by-step', async () => {
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValueOnce({
      id: 'item-1',
      orderId: 'ord-1',
      storeId: 'store-123',
      subOrderStatus: 'PLACED',
    } as any);

    vi.mocked(prisma.orderItem.update).mockResolvedValueOnce({
      id: 'item-1',
      subOrderStatus: 'SELLER_ACCEPTED',
    } as any);

    vi.mocked(prisma.orderItem.findMany).mockResolvedValueOnce([
      { subOrderStatus: 'SELLER_ACCEPTED' },
    ] as any);

    const updated = await advanceSubOrderStatus('seller-user-1', 'item-1', 'SELLER_ACCEPTED');

    expect(updated.subOrderStatus).toBe('SELLER_ACCEPTED');
    expect(prisma.orderItem.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: { subOrderStatus: 'SELLER_ACCEPTED' },
    });
  });

  it('throws InvalidTransitionError on skipping lifecycle steps', async () => {
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValueOnce({
      id: 'item-1',
      orderId: 'ord-1',
      storeId: 'store-123',
      subOrderStatus: 'PLACED',
    } as any);

    await expect(
      advanceSubOrderStatus('seller-user-1', 'item-1', 'SHIPPED')
    ).rejects.toThrow(InvalidTransitionError);
  });

  it('generates a 6-digit OTP code when transitioning to OUT_FOR_DELIVERY', async () => {
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValueOnce({
      id: 'item-1',
      orderId: 'ord-1',
      storeId: 'store-123',
      subOrderStatus: 'SHIPPED',
    } as any);

    (prisma.orderItem.update as any).mockImplementationOnce(async ({ data }: any) => ({
      id: 'item-1',
      subOrderStatus: data.subOrderStatus,
      otpCode: data.otpCode,
    }));

    vi.mocked(prisma.orderItem.findMany).mockResolvedValueOnce([
      { subOrderStatus: 'OUT_FOR_DELIVERY' },
    ] as any);

    const updated = await advanceSubOrderStatus('seller-user-1', 'item-1', 'OUT_FOR_DELIVERY');

    expect(updated.subOrderStatus).toBe('OUT_FOR_DELIVERY');
    expect(updated.otpCode).toMatch(/^\d{6}$/);
  });

  it('successfully confirms delivery on valid OTP match and clears OTP', async () => {
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValueOnce({
      id: 'item-1',
      orderId: 'ord-1',
      storeId: 'store-123',
      subOrderStatus: 'OUT_FOR_DELIVERY',
      otpCode: '492019',
    } as any);

    vi.mocked(prisma.orderItem.update).mockResolvedValueOnce({
      id: 'item-1',
      subOrderStatus: 'DELIVERED',
      deliveredAt: new Date(),
      otpCode: null,
    } as any);

    vi.mocked(prisma.orderItem.findMany).mockResolvedValueOnce([
      { subOrderStatus: 'DELIVERED' },
    ] as any);

    const delivered = await verifyDeliveryOtp('seller-user-1', 'item-1', '492019');

    expect(delivered.subOrderStatus).toBe('DELIVERED');
    expect(prisma.orderItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-1' },
        data: expect.objectContaining({ subOrderStatus: 'DELIVERED', otpCode: null }),
      })
    );
  });

  it('rejects invalid delivery OTP with InvalidOtpError', async () => {
    vi.mocked(prisma.orderItem.findFirst).mockResolvedValueOnce({
      id: 'item-1',
      orderId: 'ord-1',
      storeId: 'store-123',
      subOrderStatus: 'OUT_FOR_DELIVERY',
      otpCode: '492019',
    } as any);

    await expect(
      verifyDeliveryOtp('seller-user-1', 'item-1', '999999')
    ).rejects.toThrow(InvalidOtpError);
  });
});
