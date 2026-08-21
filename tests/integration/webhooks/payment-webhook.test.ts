import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '@/modules/payments/payment.service';
import { PaymentVerification } from '@/modules/payments/verification';
import { IdempotencyService } from '@/modules/payments/idempotency';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      upsert: vi.fn(),
    },
    productVariant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    processedEvent: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('Payment Webhook Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects webhooks with invalid signatures', async () => {
    vi.spyOn(PaymentVerification, 'verifyWebhookSignature').mockReturnValueOnce(false);

    const result = await PaymentService.handleWebhookEvent('{}', 'invalid_sig');

    expect(result.received).toBe(false);
    expect(result.reason).toBe('Invalid signature');
  });

  it('idempotently processes valid payment.captured events', async () => {
    vi.spyOn(PaymentVerification, 'verifyWebhookSignature').mockReturnValueOnce(true);
    vi.spyOn(IdempotencyService, 'acquireLock').mockResolvedValueOnce(true);

    const mockOrder = {
      id: 'ord-123',
      totalAmount: 999.0,
      orderStatus: 'AWAITING_PAYMENT',
      orderItems: [{ variantId: 'var-1', quantity: 1 }],
    };

    vi.mocked(prisma.order.findUnique).mockResolvedValueOnce(mockOrder as any);
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValueOnce({
      id: 'var-1',
      stock: 10,
      reservedStock: 1,
    } as any);
    vi.mocked(prisma.productVariant.update).mockResolvedValueOnce({} as any);
    vi.mocked(prisma.order.update).mockResolvedValueOnce({} as any);
    vi.mocked(prisma.payment.upsert).mockResolvedValueOnce({} as any);

    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_ABC123',
            notes: { orderId: 'ord-123' },
          },
        },
      },
    };

    const result = await PaymentService.handleWebhookEvent(JSON.stringify(payload), 'valid_sig');

    expect(result.received).toBe(true);
    expect(result.processed).toBe(true);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'ord-123' },
      data: { orderStatus: 'PAYMENT_SUCCESSFUL', reservationExpiresAt: null },
    });
  });

  it('skips processing if event is duplicate (already processed)', async () => {
    vi.spyOn(PaymentVerification, 'verifyWebhookSignature').mockReturnValueOnce(true);
    vi.spyOn(IdempotencyService, 'acquireLock').mockResolvedValueOnce(false); // Lock already held

    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_DUPLICATE_123',
            notes: { orderId: 'ord-123' },
          },
        },
      },
    };

    const result = await PaymentService.handleWebhookEvent(JSON.stringify(payload), 'valid_sig');

    expect(result.received).toBe(true);
    expect(result.processed).toBe(true);
    expect(result.reason).toBe('Event already processed');
    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});
