import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/modules/payments/payment.service';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Payment Webhook Receiver',
    endpoint: '/api/webhooks/payment',
  });
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature') || '';
    const rawBody = await request.text();

    if (!signature) {
      logger.warn('Payment webhook missing signature header');
      return NextResponse.json(
        { success: false, error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      );
    }

    const result = await PaymentService.handleWebhookEvent(rawBody, signature);

    if (!result.received && result.reason === 'Invalid signature') {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      received: result.received,
      processed: result.processed,
    });
  } catch (error) {
    logger.error('Error processing payment webhook', { error });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal webhook processing error',
      },
      { status: 500 }
    );
  }
}
