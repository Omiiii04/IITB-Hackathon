// POST /api/auth/login — FR-1.4: issues the access/refresh token pair for
// email/password login. Counterpart to the Google OAuth callback — both
// converge on the same signAccessToken/signRefreshToken + cookie flow.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { loginSchema } from '@/modules/auth/schemas';
import { verifyPassword } from '@/modules/auth/auth.service';
import {
  signAccessToken,
  signRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from '@/modules/auth/jwt';
import type { ApiResponse, AuthUser } from '@/types';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Validation failed', message: parsed.error.issues[0]?.message },
      { status: 422 },
    );
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // FR-1.5: accounts created via Google OAuth have no password_hash —
  // reject password login for them with the same generic message as "wrong
  // password" so the response can't be used to enumerate account type.
  if (!user || !user.passwordHash) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }

  const isValid = await verifyPassword(user.passwordHash, password);
  if (!isValid) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid email or password' }, { status: 401 });
  }

  const authUser: AuthUser = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  logger.info('User logged in', { userId: user.id });

  const response = NextResponse.json<ApiResponse<{ accessToken: string; user: AuthUser }>>({
    success: true,
    data: { accessToken, user: authUser },
  });

  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return response;
}
