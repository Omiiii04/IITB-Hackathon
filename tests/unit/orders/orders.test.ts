import { describe, it, expect } from 'vitest';
import { getOrderTimelineSteps, groupOrderItemsByStore } from '@/modules/orders/orders.service';

describe('Order Service — Timeline & Grouping Unit Tests', () => {
  it('generates correct timeline steps for PLACED status', () => {
    const steps = getOrderTimelineSteps('PAYMENT_SUCCESSFUL', 'PLACED');
    expect(steps.length).toBe(6);
    expect(steps[0].key).toBe('PLACED');
    expect(steps[0].completed).toBe(true);
    expect(steps[0].active).toBe(true);
    expect(steps[1].completed).toBe(false);
  });

  it('generates correct timeline steps for SHIPPED status', () => {
    const steps = getOrderTimelineSteps('PROCESSING', 'SHIPPED');
    expect(steps.length).toBe(6);
    const shippedStep = steps.find((s) => s.key === 'SHIPPED');
    expect(shippedStep?.completed).toBe(true);
    expect(shippedStep?.active).toBe(true);
    const deliveredStep = steps.find((s) => s.key === 'DELIVERED');
    expect(deliveredStep?.completed).toBe(false);
  });

  it('handles CANCELLED order status', () => {
    const steps = getOrderTimelineSteps('CANCELLED');
    expect(steps.length).toBe(2);
    expect(steps[1].key).toBe('CANCELLED');
    expect(steps[1].active).toBe(true);
  });

  it('groups multi-vendor order items by store correctly', () => {
    const rawItems = [
      {
        id: 'item-1',
        variantId: 'var-1',
        storeId: 'store-a',
        productTitleSnapshot: 'Wireless Headphones',
        unitPrice: 2000,
        quantity: 1,
        totalPrice: 2000,
        subOrderStatus: 'PACKED',
        store: { storeName: 'Audio Central' },
      },
      {
        id: 'item-2',
        variantId: 'var-2',
        storeId: 'store-a',
        productTitleSnapshot: 'Audio Cable',
        unitPrice: 300,
        quantity: 2,
        totalPrice: 600,
        subOrderStatus: 'PACKED',
        store: { storeName: 'Audio Central' },
      },
      {
        id: 'item-3',
        variantId: 'var-3',
        storeId: 'store-b',
        productTitleSnapshot: 'Phone Case',
        unitPrice: 500,
        quantity: 1,
        totalPrice: 500,
        subOrderStatus: 'SHIPPED',
        store: { storeName: 'Mobile World' },
      },
    ];

    const groups = groupOrderItemsByStore(rawItems);
    expect(groups.length).toBe(2);

    const storeA = groups.find((g) => g.storeId === 'store-a');
    expect(storeA).toBeDefined();
    expect(storeA?.storeName).toBe('Audio Central');
    expect(storeA?.subtotal).toBe(2600);
    expect(storeA?.items.length).toBe(2);

    const storeB = groups.find((g) => g.storeId === 'store-b');
    expect(storeB).toBeDefined();
    expect(storeB?.storeName).toBe('Mobile World');
    expect(storeB?.subtotal).toBe(500);
    expect(storeB?.items.length).toBe(1);
    expect(storeB?.subOrderStatus).toBe('SHIPPED');
  });
});
