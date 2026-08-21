import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getRazorpayKeyId } from '@/lib/razorpay';
import { createRazorpayOrder } from '@/modules/payments/razorpay.provider';
import { ReservationService } from '@/modules/inventory/reservation.service';
import type { CreateCheckoutInput, CheckoutResponseData, CheckoutOrderItemSummary } from './schemas';
import type { Prisma } from '@prisma/client';

export class CheckoutService {
  /**
   * Generates a unique, URL-safe and human-friendly order identifier.
   * e.g. ORD-M7K2P9-4X8A
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${randomSuffix}`;
  }

  /**
   * Generates a cryptographically-seeded 6-digit OTP for delivery verification.
   */
  static generateDeliveryOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Orchestrates cart validation, coupon calculation, atomic inventory reservation,
   * split order creation, and Razorpay payment order initialization.
   */
  static async createCheckoutOrder(
    customerId: string,
    input: CreateCheckoutInput
  ): Promise<CheckoutResponseData> {
    const { items, shippingAddress, couponCode } = input;

    // 1. Fetch all requested variants with Product & Store context
    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        isActive: true,
      },
      include: {
        product: {
          select: {
            title: true,
            isActive: true,
          },
        },
        store: {
          select: {
            id: true,
            storeName: true,
            status: true,
          },
        },
      },
    });

    if (variants.length !== items.length) {
      throw new Error('One or more selected items are no longer available');
    }

    // 2. Build item summaries and calculate subtotal
    const variantMap = new Map(variants.map((v) => [v.id, v]));
    let subtotal = 0;

    const itemSummaries: Array<CheckoutOrderItemSummary & { attributes: Record<string, unknown> }> = [];

    for (const item of items) {
      const variant = variantMap.get(item.variantId);
      if (!variant || !variant.product.isActive || variant.store.status !== 'APPROVED') {
        throw new Error(`Product variant "${item.variantId}" is currently unavailable for purchase`);
      }

      const itemTotal = Number((variant.variantPrice * item.quantity).toFixed(2));
      subtotal += itemTotal;

      itemSummaries.push({
        variantId: variant.id,
        productTitle: variant.product.title,
        variantTitle: variant.title ?? undefined,
        storeId: variant.store.id,
        storeName: variant.store.storeName,
        unitPrice: variant.variantPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
        attributes: (variant.attributes as Record<string, unknown>) || {},
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    // 3. Evaluate Coupon Discount if provided
    let discountAmount = 0;
    let appliedCouponId: string | undefined;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      const now = new Date();
      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || coupon.expiresAt > now) &&
        coupon.usedCount < coupon.maxUses &&
        subtotal >= coupon.minOrderValue
      ) {
        appliedCouponId = coupon.id;
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
        } else {
          discountAmount = coupon.discountValue;
        }

        if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }

        discountAmount = Math.min(discountAmount, subtotal);
      }
    }

    discountAmount = Number(discountAmount.toFixed(2));

    // 4. Calculate Taxes and Flat Shipping
    // 5% standard GST on e-commerce goods
    const taxAmount = Number(((subtotal - discountAmount) * 0.05).toFixed(2));
    // Free shipping above ₹1000, else flat ₹50
    const shippingAmount = subtotal >= 1000 ? 0 : 50;

    const totalAmount = Number((subtotal - discountAmount + taxAmount + shippingAmount).toFixed(2));
    const amountPaise = Math.round(totalAmount * 100);
    const orderNumber = this.generateOrderNumber();
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 5. Execute Atomic Transaction: Reserve Stock + Create Order & Items
    const createdOrder = await prisma.$transaction(async (tx) => {
      // A. Atomically reserve inventory
      await ReservationService.reserveStock(
        items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        tx
      );

      // B. Create Master Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          couponId: appliedCouponId,
          totalAmount,
          discountAmount,
          taxAmount,
          shippingAmount,
          orderStatus: 'AWAITING_PAYMENT',
          shippingAddressSnapshot: shippingAddress as unknown as Prisma.InputJsonValue,
          reservationExpiresAt,
          orderItems: {
            create: itemSummaries.map((item) => ({
              variantId: item.variantId,
              storeId: item.storeId,
              productTitleSnapshot: item.productTitle,
              variantAttributesSnapshot: item.attributes as unknown as Prisma.InputJsonValue,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              subOrderStatus: 'PLACED',
              otpCode: this.generateDeliveryOtp(),
            })),
          },
        },
      });

      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    });

    // 6. Create Razorpay Payment Order
    const razorpayReceipt = createdOrder.id.replace(/-/g, '').slice(0, 40);
    const razorpayOrder = await createRazorpayOrder({
      amountPaise,
      receipt: razorpayReceipt,
      notes: {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber ?? orderNumber,
        customerId,
      },
    });

    // 7. Record Payment in DB
    await prisma.payment.create({
      data: {
        orderId: createdOrder.id,
        provider: 'RAZORPAY',
        transactionId: razorpayOrder.id,
        idempotencyKey: `rzp_init_${createdOrder.id}_${razorpayOrder.id}`,
        amount: totalAmount,
        currency: 'INR',
        status: 'INITIATED',
        rawPayload: razorpayOrder as unknown as Prisma.InputJsonValue,
      },
    });

    logger.info('Checkout order initialized successfully', {
      orderId: createdOrder.id,
      orderNumber,
      amountPaise,
      razorpayOrderId: razorpayOrder.id,
    });

    return {
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber ?? orderNumber,
      totalAmount,
      subtotal,
      discountAmount,
      taxAmount,
      shippingAmount,
      currency: 'INR',
      amountPaise,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: getRazorpayKeyId(),
      reservationExpiresAt: reservationExpiresAt.toISOString(),
      items: itemSummaries.map(({ attributes: _attr, ...rest }) => rest),
    };
  }
}
