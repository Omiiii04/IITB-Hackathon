// POST /api/auth/register — FR-1.1 / FR-1.2: native email/password
// registration. Validates with registerSchema, hashes the password with
// Argon2id (modules/auth/auth.service.ts), and creates the User row.
//
// Note on FR-1.3 (mandatory seller email verification before store
// provisioning): that's a separate, later concern — a SELLER account is
// created here in an unverified state (isEmailVerified: false); gating
// store provisioning on it is out of scope for this commit.

import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/modules/auth/schemas';
import { registerUser, EmailAlreadyExistsError } from '@/modules/auth/auth.service';
import { logger } from '@/lib/logger';
import type { ApiResponse, AuthUser } from '@/types';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Validation failed', message: parsed.error.issues[0]?.message },
      { status: 422 },
    );
  }

  try {
    const user = await registerUser(parsed.data);
    return NextResponse.json<ApiResponse<AuthUser>>({ success: true, data: user }, { status: 201 });
  } catch (err) {
    if (err instanceof EmailAlreadyExistsError) {
      // Deliberately generic — do not reveal whether the collision is with
      // a password account or an OAuth-only account.
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    logger.error('Registration failed', { err });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Registration failed' },
      { status: 500 },
    );
  }
}
