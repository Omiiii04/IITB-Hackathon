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
//                                profile, and create/link the platform User
//
// Session issuance (setting the platform's own access/refresh tokens) is
// intentionally NOT done here yet — that's
// `feat(auth): HTTP-only refresh cookie + in-memory access token flow`,
// a separate commit that also covers the email/password login path. For now
// this proves out account creation/linking and redirects back to the login
// page with a status flag.

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import {
  buildGoogleAuthUrl,
  exchangeCodeForTokens,
  fetchGoogleProfile,
} from '@/modules/auth/google.provider';
import { findOrCreateGoogleUser } from '@/modules/auth/auth.service';

const STATE_COOKIE_NAME = 'google_oauth_state';
const STATE_COOKIE_MAX_AGE_SECONDS = 300; // 5 min — long enough for the round trip

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
    const state = crypto.randomUUID();
    const response = NextResponse.redirect(buildGoogleAuthUrl(state));

    response.cookies.set(STATE_COOKIE_NAME, state, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/oauth/google',
      maxAge: STATE_COOKIE_MAX_AGE_SECONDS,
    });

    return response;
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

    // TODO(next commit — HTTP-only refresh cookie + in-memory access token
    // flow): issue the platform's own access/refresh tokens here instead of
    // just redirecting, so this converges with the email/password login path.
    const response = NextResponse.redirect(new URL('/login?oauth=linked', env.NEXT_PUBLIC_APP_URL));
    response.cookies.delete(STATE_COOKIE_NAME);
    return response;
  } catch (err) {
    logger.error('Google OAuth callback failed', { err });
    const response = NextResponse.redirect(new URL('/login?error=oauth_failed', env.NEXT_PUBLIC_APP_URL));
    response.cookies.delete(STATE_COOKIE_NAME);
    return response;
  }
}
