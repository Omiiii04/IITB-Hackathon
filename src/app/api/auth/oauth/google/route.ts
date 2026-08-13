// GET /api/auth/oauth/google
//
// Handles both legs of Google's OAuth 2.0 authorization-code redirect flow
// (FR-1.1), matching GOOGLE_CALLBACK_URL in .env.example (a single route
// doubles as both the "start sign-in" link and the callback Google redirects
// back to):
//
//   - No `code` query param  -> redirect the browser to Google's consent
//                                screen (with a CSRF state cookie)
//   - `code` present         -> validate state, exchange the code, fetch the
//                                profile, create/link the platform User, and
//                                set the same refresh cookie the
//                                email/password login route sets (FR-1.4).
//                                The client's AuthProvider picks up the
//                                access token on its next mount-time
//                                POST /api/auth/refresh — no token is ever
//                                put in the redirect URL.

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import {
  buildGoogleAuthUrl,
  exchangeCodeForTokens,
  fetchGoogleProfile,
  GoogleOAuthNotConfiguredError,
} from '@/modules/auth/google.provider';
import { findOrCreateGoogleUser } from '@/modules/auth/auth.service';
import { prisma } from '@/lib/prisma';
import { signRefreshToken, REFRESH_COOKIE_NAME, refreshCookieOptions, getRefreshTokenExpiry } from '@/modules/auth/jwt';
import type { ApiResponse } from '@/types';

const STATE_COOKIE_NAME = 'google_oauth_state';
const STATE_COOKIE_MAX_AGE_SECONDS = 300; // 5 min — long enough for the round trip

// Use path '/' so the browser reliably sends the cookie on the callback URL
// (which has the same pathname but with ?code=&state= query parameters).
// A narrow path like '/api/auth/oauth/google' caused state mismatches because
// some browsers don't send cookies when the path matches but query parameters
// are appended (behaviour varies between browser implementations).
const STATE_COOKIE_PATH = '/';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const consentError = request.nextUrl.searchParams.get('error');

  if (consentError) {
    logger.warn('Google OAuth consent denied or errored', { consentError });
    return NextResponse.redirect(new URL('/login?error=oauth_denied', env.NEXT_PUBLIC_APP_URL));
  }

  // Leg 1: no code yet — kick off the redirect to Google, stashing a random
  // state value in a short-lived, httpOnly cookie to verify on the way back.
  if (!code) {
    let authUrl: string;
    try {
      const state = crypto.randomUUID();
      authUrl = buildGoogleAuthUrl(state);
      const response = NextResponse.redirect(authUrl);

      response.cookies.set(STATE_COOKIE_NAME, state, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: STATE_COOKIE_PATH,
        maxAge: STATE_COOKIE_MAX_AGE_SECONDS,
      });

      return response;
    } catch (err) {
      if (err instanceof GoogleOAuthNotConfiguredError) {
        logger.error('Google OAuth is not configured — missing environment variables');
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Google sign-in is not available in this environment' },
          { status: 503 },
        );
      }
      throw err;
    }
  }

  // Leg 2: Google redirected back with a code — verify state, exchange,
  // fetch profile, create/link the account.
  const returnedState = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(STATE_COOKIE_NAME)?.value;

  if (!expectedState || returnedState !== expectedState) {
    logger.warn('Google OAuth state mismatch — possible CSRF attempt');
    return NextResponse.redirect(
      new URL('/login?error=oauth_state_mismatch', env.NEXT_PUBLIC_APP_URL),
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleProfile(tokens.access_token);
    const user = await findOrCreateGoogleUser(profile);

    logger.info('Google OAuth sign-in succeeded', { userId: user.id });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const refreshToken = signRefreshToken(user.id, session.id);
    const response = NextResponse.redirect(new URL('/', env.NEXT_PUBLIC_APP_URL));
    response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    // Delete state cookie using the same path it was set on, so browsers
    // that scope cookies by path correctly remove it.
    response.cookies.set(STATE_COOKIE_NAME, '', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: STATE_COOKIE_PATH,
      maxAge: 0,
    });
    return response;
  } catch (err) {
    logger.error('Google OAuth callback failed', { err });
    const response = NextResponse.redirect(
      new URL('/login?error=oauth_failed', env.NEXT_PUBLIC_APP_URL),
    );
    response.cookies.set(STATE_COOKIE_NAME, '', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: STATE_COOKIE_PATH,
      maxAge: 0,
    });
    return response;
  }
}
