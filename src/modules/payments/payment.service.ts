import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { PaymentVerification } from './verification';
import { IdempotencyService } from './idempotency';
import { ReservationService } from '@/modules/inventory/reservation.service';
import type { PaymentVerificationInput, PaymentVerificationResult, WebhookPayload } from './schemas';
import type { Prisma } from '@prisma/client';

export class PaymentService {
  /**
   * Validates client-side Razorpay payment callback signature and atomically transitions
   * Order to PAYMENT_SUCCESSFUL and commits stock reservations.
   */
  static async verifyAndConfirmPayment(
    input: PaymentVerificationInput
  ): Promise<PaymentVerificationResult> {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    // 1. Cryptographic HMAC verification
    const isValid = PaymentVerification.verifyCheckoutSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      throw new Error('Invalid Razorpay payment signature');
    }

    // 2. Fetch Order with Items and Payment details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          select: {
            variantId: true,
            quantity: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new Error(`Order "${orderId}" not found`);
    }

    // If order already marked successful, return idempotent success
    if (order.orderStatus === 'PAYMENT_SUCCESSFUL' || order.orderStatus === 'PROCESSING') {
      return {
        verified: true,
        orderId: order.id,
        orderNumber: order.orderNumber ?? undefined,
        paymentStatus: 'SUCCESS',
        transactionId: razorpayPaymentId,
      };
    }

    // 3. Atomically transition Order, Payment, and Stock Reservation
    await prisma.$transaction(async (tx) => {
      // A. Commit reserved stock to physical inventory reduction
      await ReservationService.commitReservation(
        order.orderItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        tx
      );

      // B. Update Order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: 'PAYMENT_SUCCESSFUL',
          reservationExpiresAt: null,
        },
      });

      // C. Update or Create Payment record
      const existingPayment = order.payments.find((p) => p.transactionId === razorpayOrderId);
      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: 'SUCCESS',
            transactionId: razorpayPaymentId,
            rawPayload: {
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
              verifiedAt: new Date().toISOString(),
            } as Prisma.InputJsonValue,
          },
        });
      } else {
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: 'RAZORPAY',
            transactionId: razorpayPaymentId,
            idempotencyKey: `rzp_succ_${order.id}_${razorpayPaymentId}`,
            amount: order.totalAmount,
            currency: 'INR',
            status: 'SUCCESS',
            rawPayload: {
              razorpayOrderId,
              razorpayPaymentId,
              razorpaySignature,
              verifiedAt: new Date().toISOString(),
            } as Prisma.InputJsonValue,
          },
        });
      }

      // D. Update sub-orders
      await tx.orderItem.updateMany({
        where: { orderId: order.id },
        data: { subOrderStatus: 'PLACED' },
      });
    });

    logger.info('Payment confirmed and inventory committed successfully', {
      orderId: order.id,
      paymentId: razorpayPaymentId,
    });

    return {
      verified: true,
      orderId: order.id,
      orderNumber: order.orderNumber ?? undefined,
      paymentStatus: 'SUCCESS',
      transactionId: razorpayPaymentId,
    };
  }

  /**
   * Handles incoming Razorpay webhook events with idempotency and signature validation.
   */
  static async handleWebhookEvent(
    rawBody: string,
    signature: string
  ): Promise<{ received: boolean; processed: boolean; reason?: string }> {
    // 1. Signature check
    const isValid = PaymentVerification.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn('Rejected unauthorized webhook request');
      return { received: false, processed: false, reason: 'Invalid signature' };
    }

    // 2. Parse payload
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return { received: false, processed: false, reason: 'Malformed JSON payload' };
    }

    const eventName = payload.event;
    const paymentEntity = payload.payload?.payment?.entity as Record<string, unknown> | undefined;
    const paymentId = (paymentEntity?.id as string) || (payload.account_id ? `${payload.account_id}_${payload.created_at}` : undefined);

    if (!paymentId) {
      return { received: true, processed: false, reason: 'No identifiable entity in webhook payload' };
    }

    // 3. Acquire Idempotency Lock
    const lockAcquired = await IdempotencyService.acquireLock(paymentId, eventName, payload);
    if (!lockAcquired) {
      return { received: true, processed: true, reason: 'Event already processed' };
    }

    // 4. Handle Event Types
    const notes = (paymentEntity?.notes as Record<string, string>) || {};
    const orderId = notes.orderId;

    if (eventName === 'payment.captured' || eventName === 'order.paid') {
      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { orderItems: true },
        });

        if (order && order.orderStatus !== 'PAYMENT_SUCCESSFUL') {
          await prisma.$transaction(async (tx) => {
            await ReservationService.commitReservation(
              order.orderItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
              tx
            );

            await tx.order.update({
              where: { id: order.id },
              data: { orderStatus: 'PAYMENT_SUCCESSFUL', reservationExpiresAt: null },
            });

            await tx.payment.upsert({
              where: { transactionId: paymentId },
              create: {
                orderId: order.id,
                provider: 'RAZORPAY',
                transactionId: paymentId,
                idempotencyKey: `wh_${paymentId}`,
                amount: order.totalAmount,
                status: 'SUCCESS',
                rawPayload: payload as unknown as Prisma.InputJsonValue,
              },
              update: {
                status: 'SUCCESS',
                rawPayload: payload as unknown as Prisma.InputJsonValue,
              },
            });
          });

          logger.info('Webhook successfully reconciled order payment', { orderId, paymentId });
        }
      }
    } else if (eventName === 'payment.failed') {
      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { orderItems: true },
        });

        if (order && order.orderStatus === 'AWAITING_PAYMENT') {
          await prisma.$transaction(async (tx) => {
            await ReservationService.releaseReservation(
              order.orderItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
              tx
            );

            await tx.order.update({
              where: { id: order.id },
              data: { orderStatus: 'PAYMENT_FAILED' },
            });

            await tx.payment.upsert({
              where: { transactionId: paymentId },
              create: {
                orderId: order.id,
                provider: 'RAZORPAY',
                transactionId: paymentId,
                idempotencyKey: `wh_fail_${paymentId}`,
                amount: order.totalAmount,
                status: 'FAILED',
                rawPayload: payload as unknown as Prisma.InputJsonValue,
              },
              update: {
                status: 'FAILED',
                rawPayload: payload as unknown as Prisma.InputJsonValue,
              },
            });
          });

          logger.info('Webhook handled payment failure and released stock', { orderId, paymentId });
        }
      }
    }

    return { received: true, processed: true };
  }
}
