// POST /api/auth/logout — clears the refresh cookie server-side. The
// in-memory access token is discarded client-side (see useAuth().logout).
// Nothing else to invalidate server-side — access tokens are stateless JWTs
// that simply expire on their own short TTL.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { REFRESH_COOKIE_NAME, verifyRefreshToken } from '@/modules/auth/jwt';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await prisma.session.deleteMany({ where: { id: payload.jti } });
    } catch {
      // Ignore invalid/expired tokens during logout
    }
  }

  const response = NextResponse.json<ApiResponse>({ success: true });
  response.cookies.delete(REFRESH_COOKIE_NAME);
  return response;
}
