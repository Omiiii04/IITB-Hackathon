import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Prisma } from '@prisma/client';

export class IdempotencyService {
  /**
   * Tries to acquire an idempotency lock for an incoming webhook or transaction event.
   * Returns `true` if the event is new and lock was acquired.
   * Returns `false` if the event has already been processed (preventing replay).
   */
  static async acquireLock(
    eventId: string,
    eventType?: string,
    payload?: unknown,
    provider: string = 'RAZORPAY'
  ): Promise<boolean> {
    try {
      await prisma.processedEvent.create({
        data: {
          provider,
          eventId,
          eventType: eventType ?? 'unknown',
          payload: payload ? (payload as Prisma.InputJsonValue) : undefined,
        },
      });

      logger.info('Acquired idempotency lock for event', { provider, eventId, eventType });
      return true;
    } catch (error) {
      // Prisma P2002 is Unique constraint failed
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        logger.warn('Duplicate event detected via idempotency lock', { provider, eventId });
        return false;
      }

      logger.error('Error acquiring idempotency lock', { error, provider, eventId });
      throw error;
    }
  }

  /**
   * Checks if an event has already been processed.
   */
  static async isProcessed(eventId: string, provider: string = 'RAZORPAY'): Promise<boolean> {
    const existing = await prisma.processedEvent.findUnique({
      where: {
        provider_eventId: {
          provider,
          eventId,
        },
      },
      select: { id: true },
    });

    return !!existing;
  }
}
