import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReservationService } from '@/modules/inventory/reservation.service';
import { InsufficientStockError } from '@/modules/inventory/schemas';
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

describe('ReservationService - Stock Reservation Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully reserves stock when available stock is sufficient', async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValueOnce({
      id: 'var-1',
      title: 'T-Shirt - L',
      stock: 10,
      reservedStock: 2,
      isActive: true,
    } as any);

    vi.mocked(prisma.productVariant.update).mockResolvedValueOnce({} as any);

    await expect(
      ReservationService.reserveStock([{ variantId: 'var-1', quantity: 3 }])
    ).resolves.toBeUndefined();

    expect(prisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'var-1' },
      data: {
        reservedStock: { increment: 3 },
      },
    });
  });

  it('throws InsufficientStockError when requested quantity exceeds available stock', async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValueOnce({
      id: 'var-2',
      title: 'Shoes - 42',
      stock: 5,
      reservedStock: 4, // only 1 left available
      isActive: true,
    } as any);

    await expect(
      ReservationService.reserveStock([{ variantId: 'var-2', quantity: 2 }])
    ).rejects.toThrow(InsufficientStockError);

    expect(prisma.productVariant.update).not.toHaveBeenCalled();
  });

  it('releases reserved stock correctly', async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValueOnce({
      id: 'var-1',
      reservedStock: 5,
    } as any);

    vi.mocked(prisma.productVariant.update).mockResolvedValueOnce({} as any);

    await ReservationService.releaseReservation([{ variantId: 'var-1', quantity: 2 }]);

    expect(prisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'var-1' },
      data: {
        reservedStock: { decrement: 2 },
      },
    });
  });

  it('commits reserved stock to physical inventory reduction upon payment confirmation', async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValueOnce({
      id: 'var-1',
      stock: 10,
      reservedStock: 3,
    } as any);

    vi.mocked(prisma.productVariant.update).mockResolvedValueOnce({} as any);

    await ReservationService.commitReservation([{ variantId: 'var-1', quantity: 3 }]);

    expect(prisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'var-1' },
      data: {
        stock: { decrement: 3 },
        reservedStock: { decrement: 3 },
      },
    });
  });
});
