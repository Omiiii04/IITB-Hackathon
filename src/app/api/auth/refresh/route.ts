// POST /api/auth/refresh — FR-1.4: mints a fresh, short-lived access token
// from the HTTP-only refresh cookie. Called automatically by the client on
// page load (the in-memory access token doesn't survive a reload — see
// hooks/useAuth.ts) and transparently on a 401 from any protected API call.
//
// The refresh token is rotated on every use (a new one is re-issued and the
// cookie replaced) to shrink the replay window if a refresh token were ever
// exfiltrated.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  getRefreshTokenExpiry,
} from '@/modules/auth/jwt';
import type { ApiResponse, AuthUser } from '@/types';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Not authenticated' }, { status: 401 });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    const response = NextResponse.json<ApiResponse>({ success: false, error: 'Session expired' }, { status: 401 });
    response.cookies.delete(REFRESH_COOKIE_NAME);
    return response;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    const response = NextResponse.json<ApiResponse>({ success: false, error: 'Session expired' }, { status: 401 });
    response.cookies.delete(REFRESH_COOKIE_NAME);
    return response;
  }

  const existingSession = await prisma.session.findUnique({ where: { id: payload.jti } });
  if (!existingSession) {
    const response = NextResponse.json<ApiResponse>({ success: false, error: 'Session expired' }, { status: 401 });
    response.cookies.delete(REFRESH_COOKIE_NAME);
    return response;
  }

  // Delete the old session (revocation)
  await prisma.session.delete({ where: { id: payload.jti } });

  // Create a new session for the rotated token
  const newSession = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  const authUser: AuthUser = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(user.id, user.role);
  const rotatedRefreshToken = signRefreshToken(user.id, newSession.id);

  const response = NextResponse.json<ApiResponse<{ accessToken: string; user: AuthUser }>>({
    success: true,
    data: { accessToken, user: authUser },
  });

  response.cookies.set(REFRESH_COOKIE_NAME, rotatedRefreshToken, refreshCookieOptions());
  return response;
}
