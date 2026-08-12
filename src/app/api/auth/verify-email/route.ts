
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';
import {
  signEmailVerificationToken,
  verifyEmailVerificationToken,
} from '@/modules/auth/email-verification';
import type { ApiResponse } from '@/types';

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const GENERIC_SUCCESS: ApiResponse = {
  success: true,
  message: 'If that email exists and is not yet verified, a verification link has been sent.',
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Enter a valid email address' }, { status: 422 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (user && !user.isEmailVerified) {
    const token = signEmailVerificationToken(user.id, user.email);
    const verifyUrl = new URL('/api/auth/verify-email', env.NEXT_PUBLIC_APP_URL);
    verifyUrl.searchParams.set('token', token);

    logger.info('Email verification link generated', { userId: user.id, verifyUrl: verifyUrl.toString() });
  }

  return NextResponse.json<ApiResponse>(GENERIC_SUCCESS);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Missing verification token' }, { status: 400 });
  }

  let payload;
  try {
    payload = verifyEmailVerificationToken(token);
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'This verification link is invalid or has expired' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.email !== payload.email) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'This verification link is invalid' }, { status: 400 });
  }

  if (!user.isEmailVerified) {
    await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });
    logger.info('Email verified', { userId: user.id });
  }

  return NextResponse.json<ApiResponse>({ success: true, message: 'Email verified successfully' });
}