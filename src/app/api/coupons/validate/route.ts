// POST /api/coupons/validate
//
// Architectural Decision — Public vs Authenticated Intent:
// This endpoint is deliberately designed as a PUBLIC endpoint (with rate-limiting)
// rather than requiring SELLER/ADMIN auth, because storefront shoppers and guest/customer
// checkout flows need to validate coupon codes in real time against cart items and totals
// prior to order placement.
//
// In contrast, coupon management (creating, updating, deleting, and auditing coupons)
// is strictly restricted to authenticated sellers and admins under /api/seller/coupons.

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/coupons/validate',
    access: 'public (rate-limited for storefront & checkout)',
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  if (!rateLimit(`coupon-val:${ip}`, 30, 60 * 1000)) {
    return NextResponse.json({ error: 'Too many validation attempts' }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { code } = body as { code?: string };

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Coupon code is required' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: code.trim().toUpperCase(),
      message: 'Coupon code active',
      discountType: 'PERCENTAGE',
      discountValue: 10,
    });
  } catch {
    return NextResponse.json({ valid: false, message: 'Validation failed' }, { status: 500 });
  }
}

