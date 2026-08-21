import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { InsufficientStockError, type ReserveItem } from './schemas';
import type { Prisma, PrismaClient } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

export class ReservationService {
  /**
   * Atomically reserves stock for checkout items.
   * Ensures (stock - reservedStock) >= requestedQuantity for every item.
   */
  static async reserveStock(items: ReserveItem[], client: DbClient = prisma): Promise<void> {
    for (const item of items) {
      const variant = await client.productVariant.findUnique({
        where: { id: item.variantId },
        select: {
          id: true,
          title: true,
          stock: true,
          reservedStock: true,
          isActive: true,
        },
      });

      if (!variant || !variant.isActive) {
        throw new InsufficientStockError(item.variantId, 0, item.quantity, 'Inactive or missing item');
      }

      const availableStock = variant.stock - variant.reservedStock;
      if (availableStock < item.quantity) {
        throw new InsufficientStockError(
          variant.id,
          availableStock,
          item.quantity,
          variant.title ?? undefined
        );
      }

      await client.productVariant.update({
        where: { id: item.variantId },
        data: {
          reservedStock: { increment: item.quantity },
        },
      });
    }

    logger.info('Stock reserved successfully for checkout items', {
      itemCount: items.length,
      variants: items.map((i) => ({ id: i.variantId, qty: i.quantity })),
    });
  }

  /**
   * Releases previously reserved stock (e.g. on payment cancellation, failure, or timeout).
   */
  static async releaseReservation(items: ReserveItem[], client: DbClient = prisma): Promise<void> {
    for (const item of items) {
      const variant = await client.productVariant.findUnique({
        where: { id: item.variantId },
        select: { id: true, reservedStock: true },
      });

      if (!variant) continue;

      const decrementBy = Math.min(variant.reservedStock, item.quantity);
      if (decrementBy > 0) {
        await client.productVariant.update({
          where: { id: item.variantId },
          data: {
            reservedStock: { decrement: decrementBy },
          },
        });
      }
    }

    logger.info('Stock reservation released', {
      itemCount: items.length,
      variants: items.map((i) => ({ id: i.variantId, qty: i.quantity })),
    });
  }

  /**
   * Commits the reserved stock upon successful payment capture.
   * Atomically decreases actual `stock` and releases `reservedStock`.
   */
  static async commitReservation(items: ReserveItem[], client: DbClient = prisma): Promise<void> {
    for (const item of items) {
      const variant = await client.productVariant.findUnique({
        where: { id: item.variantId },
        select: { id: true, stock: true, reservedStock: true },
      });

      if (!variant) continue;

      const decrementStockBy = Math.min(variant.stock, item.quantity);
      const decrementReservedBy = Math.min(variant.reservedStock, item.quantity);

      await client.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: decrementStockBy },
          reservedStock: { decrement: decrementReservedBy },
        },
      });
    }

    logger.info('Stock reservation committed to physical stock reduction', {
      itemCount: items.length,
      variants: items.map((i) => ({ id: i.variantId, qty: i.quantity })),
    });
  }

  /**
   * Cleans up expired orders that are still AWAITING_PAYMENT past their reservation window.
   */
  static async cleanupExpiredReservations(): Promise<number> {
    const now = new Date();

    const expiredOrders = await prisma.order.findMany({
      where: {
        orderStatus: 'AWAITING_PAYMENT',
        reservationExpiresAt: {
          lt: now,
        },
      },
      include: {
        orderItems: {
          select: {
            variantId: true,
            quantity: true,
          },
        },
      },
    });

    let cleanedCount = 0;

    for (const order of expiredOrders) {
      await prisma.$transaction(async (tx) => {
        await this.releaseReservation(
          order.orderItems.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          tx
        );

        await tx.order.update({
          where: { id: order.id },
          data: {
            orderStatus: 'CANCELLED',
          },
        });
      });

      cleanedCount++;
    }

    if (cleanedCount > 0) {
      logger.info('Cleaned up expired stock reservations', { count: cleanedCount });
    }

    return cleanedCount;
  }
}
