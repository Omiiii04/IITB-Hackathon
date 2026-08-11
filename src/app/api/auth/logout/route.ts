// POST /api/auth/logout — clears the refresh cookie server-side. The
// in-memory access token is discarded client-side (see useAuth().logout).
// Nothing else to invalidate server-side — access tokens are stateless JWTs
// that simply expire on their own short TTL.

import { NextResponse } from 'next/server';
import { REFRESH_COOKIE_NAME } from '@/modules/auth/jwt';
import type { ApiResponse } from '@/types';

export async function POST() {
  const response = NextResponse.json<ApiResponse>({ success: true });
  response.cookies.delete(REFRESH_COOKIE_NAME);
  return response;
}
