import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReservationService } from '@/modules/inventory/reservation.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      productVariant: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      order: {
        findMany: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(prisma)),
    },
  };
});

describe('ReservationService - Expiry Cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('identifies expired unpaid orders, releases stock, and marks order CANCELLED', async () => {
    const expiredOrders = [
      {
        id: 'ord-101',
        orderStatus: 'AWAITING_PAYMENT',
        reservationExpiresAt: new Date(Date.now() - 5000),
        orderItems: [
          { variantId: 'var-1', quantity: 2 },
          { variantId: 'var-2', quantity: 1 },
        ],
      },
    ];

    vi.mocked(prisma.order.findMany).mockResolvedValueOnce(expiredOrders as any);
    vi.mocked(prisma.productVariant.findUnique)
      .mockResolvedValueOnce({ id: 'var-1', reservedStock: 2 } as any)
      .mockResolvedValueOnce({ id: 'var-2', reservedStock: 1 } as any);
    vi.mocked(prisma.productVariant.update).mockResolvedValue({} as any);
    vi.mocked(prisma.order.update).mockResolvedValueOnce({} as any);

    const count = await ReservationService.cleanupExpiredReservations();

    expect(count).toBe(1);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'ord-101' },
      data: { orderStatus: 'CANCELLED' },
    });
  });

  it('returns 0 when there are no expired orders', async () => {
    vi.mocked(prisma.order.findMany).mockResolvedValueOnce([]);

    const count = await ReservationService.cleanupExpiredReservations();
    expect(count).toBe(0);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});
