import type { SubOrderStatus, OrderStatus } from '@prisma/client';

export interface TimelineStep {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface GroupedSubOrder {
  storeId: string;
  storeName: string;
  logoUrl?: string | null;
  items: Array<{
    id: string;
    variantId: string;
    productTitle: string;
    variantAttributes?: Record<string, unknown> | null;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    subOrderStatus: SubOrderStatus;
    otpCode?: string | null;
    trackingNumber?: string | null;
    courierPartner?: string | null;
    deliveredAt?: Date | string | null;
  }>;
  subtotal: number;
  subOrderStatus: SubOrderStatus;
}

const TIMELINE_ORDER: SubOrderStatus[] = [
  'PLACED',
  'SELLER_ACCEPTED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

const TIMELINE_LABELS: Record<SubOrderStatus, { label: string; description: string }> = {
  PLACED: { label: 'Order Placed', description: 'Your order has been received' },
  SELLER_ACCEPTED: { label: 'Seller Confirmed', description: 'Store accepted your order' },
  PACKED: { label: 'Packed', description: 'Items packed & ready for courier pickup' },
  SHIPPED: { label: 'In Transit', description: 'Package is on the way' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', description: 'Agent is delivering your order today' },
  DELIVERED: { label: 'Delivered', description: 'Package successfully delivered' },
  CANCELLED: { label: 'Cancelled', description: 'Order item was cancelled' },
};

/**
 * Derives timeline steps for an order or sub-order status.
 */
export function getOrderTimelineSteps(
  orderStatus: OrderStatus | string,
  subOrderStatus?: SubOrderStatus | string
): TimelineStep[] {
  if (orderStatus === 'CANCELLED' || subOrderStatus === 'CANCELLED') {
    return [
      { key: 'PLACED', label: 'Order Placed', description: 'Order was placed', completed: true, active: false },
      { key: 'CANCELLED', label: 'Order Cancelled', description: 'This order was cancelled', completed: false, active: true },
    ];
  }

  if (orderStatus === 'PAYMENT_FAILED') {
    return [
      { key: 'PLACED', label: 'Order Placed', description: 'Order initiated', completed: true, active: false },
      { key: 'PAYMENT_FAILED', label: 'Payment Failed', description: 'Payment processing failed', completed: false, active: true },
    ];
  }

  // Determine current status index
  let currentStatus: SubOrderStatus = 'PLACED';
  if (subOrderStatus && TIMELINE_LABELS[subOrderStatus as SubOrderStatus]) {
    currentStatus = subOrderStatus as SubOrderStatus;
  } else if (orderStatus === 'COMPLETED' || orderStatus === 'PAYMENT_SUCCESSFUL') {
    currentStatus = orderStatus === 'COMPLETED' ? 'DELIVERED' : 'SELLER_ACCEPTED';
  }

  const currentIndex = TIMELINE_ORDER.indexOf(currentStatus);

  return TIMELINE_ORDER.map((status, index) => {
    const info = TIMELINE_LABELS[status];
    const isCompleted = index <= currentIndex;
    const isActive = index === currentIndex;

    return {
      key: status,
      label: info.label,
      description: info.description,
      completed: isCompleted,
      active: isActive,
    };
  });
}

/**
 * Groups raw OrderItems by storeId for multi-vendor split order presentation.
 */
export function groupOrderItemsByStore(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderItems: any[]
): GroupedSubOrder[] {
  const storeMap = new Map<string, GroupedSubOrder>();

  for (const item of orderItems) {
    const storeId = item.storeId ?? item.store?.id ?? 'default-store';
    const storeName = item.store?.storeName ?? item.storeName ?? 'Seller Store';
    const logoUrl = item.store?.logoUrl ?? null;

    let group = storeMap.get(storeId);
    if (!group) {
      group = {
        storeId,
        storeName,
        logoUrl,
        items: [],
        subtotal: 0,
        subOrderStatus: item.subOrderStatus ?? 'PLACED',
      };
      storeMap.set(storeId, group);
    }

    const itemTotal = item.totalPrice ?? item.unitPrice * item.quantity;
    group.subtotal += itemTotal;

    // Track highest status across items in group
    if (TIMELINE_ORDER.indexOf(item.subOrderStatus) > TIMELINE_ORDER.indexOf(group.subOrderStatus)) {
      group.subOrderStatus = item.subOrderStatus;
    }

    group.items.push({
      id: item.id,
      variantId: item.variantId,
      productTitle: item.productTitleSnapshot ?? item.productTitle ?? item.variant?.product?.title ?? 'Product',
      variantAttributes: typeof item.variantAttributesSnapshot === 'object' ? item.variantAttributesSnapshot : null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      totalPrice: itemTotal,
      subOrderStatus: item.subOrderStatus ?? 'PLACED',
      otpCode: item.otpCode ?? null,
      trackingNumber: item.trackingNumber ?? null,
      courierPartner: item.courierPartner ?? null,
      deliveredAt: item.deliveredAt ?? null,
    });
  }

  return Array.from(storeMap.values());
}


