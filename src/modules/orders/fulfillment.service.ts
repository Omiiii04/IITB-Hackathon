import { prisma } from '@/lib/prisma';
import { getOwnStoreId } from '@/modules/auth/rbac';
import type { SubOrderStatus } from '@prisma/client';

export class NoStoreError extends Error {}
export class SubOrderNotFoundError extends Error {}
export class InvalidTransitionError extends Error {}
export class InvalidOtpError extends Error {}

const FORWARD_STEPS: SubOrderStatus[] = [
  'PLACED',
  'SELLER_ACCEPTED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
];

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function listMySubOrders(userId: string) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const items = await prisma.orderItem.findMany({
    where: { storeId },
    include: { order: { select: { orderNumber: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    subOrderStatus: item.subOrderStatus,
    productTitleSnapshot: item.productTitleSnapshot,
    quantity: item.quantity,
    totalPrice: item.totalPrice,
    createdAt: item.createdAt,
    order: { orderNumber: item.order.orderNumber },
  }));
}
async function recomputeOrderStatus(orderId: string) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    select: { subOrderStatus: true },
  });

  const statuses = items.map((i) => i.subOrderStatus);
  const allDelivered = statuses.every((s) => s === 'DELIVERED');
  const anyDelivered = statuses.some((s) => s === 'DELIVERED');

  const orderStatus = allDelivered ? 'COMPLETED' : anyDelivered ? 'PARTIALLY_FULFILLED' : 'PROCESSING';

  await prisma.order.update({ where: { id: orderId }, data: { orderStatus } });
}

export async function advanceSubOrderStatus(userId: string, itemId: string, nextStatus: SubOrderStatus) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const item = await prisma.orderItem.findFirst({ where: { id: itemId, storeId } });
  if (!item) throw new SubOrderNotFoundError();

  const currentIndex = FORWARD_STEPS.indexOf(item.subOrderStatus);
  const nextIndex = FORWARD_STEPS.indexOf(nextStatus);

  if (nextIndex === -1 || nextIndex !== currentIndex + 1) {
    throw new InvalidTransitionError();
  }

  const data: { subOrderStatus: SubOrderStatus; otpCode?: string } = { subOrderStatus: nextStatus };
  if (nextStatus === 'OUT_FOR_DELIVERY') {
    data.otpCode = generateOtp();
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.orderItem.update({ where: { id: itemId }, data });
    return result;
  });

  await recomputeOrderStatus(item.orderId);

  return updated;
}

export async function verifyDeliveryOtp(userId: string, itemId: string, otp: string) {
  const storeId = await getOwnStoreId(userId);
  if (!storeId) throw new NoStoreError();

  const item = await prisma.orderItem.findFirst({ where: { id: itemId, storeId } });
  if (!item) throw new SubOrderNotFoundError();

  if (item.subOrderStatus !== 'OUT_FOR_DELIVERY' || !item.otpCode || item.otpCode !== otp) {
    throw new InvalidOtpError();
  }

  const updated = await prisma.orderItem.update({
    where: { id: itemId },
    data: { subOrderStatus: 'DELIVERED', deliveredAt: new Date(), otpCode: null },
  });

  await recomputeOrderStatus(item.orderId);

  return updated;
}