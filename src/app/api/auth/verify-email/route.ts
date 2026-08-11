// POST/GET /api/auth/verify-email — email verification is not yet implemented.
//
// Returns 501 Not Implemented so callers (UI, integration tests, API clients)
// fail loudly rather than receiving a false success. The User.isEmailVerified
// flag is set at registration / OAuth linking time; the verification-token
// delivery + redemption flow is deferred.

import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

const NOT_IMPLEMENTED: ApiResponse = {
  success: false,
  error: 'Email verification is not yet implemented',
};

export async function GET() {
  return NextResponse.json<ApiResponse>(NOT_IMPLEMENTED, { status: 501 });
}

export async function POST() {
  return NextResponse.json<ApiResponse>(NOT_IMPLEMENTED, { status: 501 });
}
