import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'MarketHub Multi-Vendor E-Commerce Platform',
      version: '0.1.0',
      framework: 'Next.js 15 (App Router)',
      runtime: 'Node.js',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      features: {
        atomicStockReservation: true,
        multiTenantIsolation: true,
        dualWebhooks: ['razorpay', 'stripe'],
        otpDeliveryHandshake: true,
        tailwindVersion: 'v4',
        typeScriptStrict: true,
      },
    },
    { status: 200 }
  );
}
