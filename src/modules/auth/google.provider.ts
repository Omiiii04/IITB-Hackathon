// Google OAuth 2.0 provider configuration (FR-1.1).
// Naming/shape mirrors modules/payments/{razorpay,stripe}.provider.ts —
// this is the "provider" module for the auth feature's Google integration.
//
// Server-side "authorization code" flow, split into three steps used by the
// route handler in app/api/auth/oauth/google/route.ts:
//   1. buildGoogleAuthUrl()    -> redirect the browser to Google's consent screen
//   2. exchangeCodeForTokens() -> swap the returned `code` for an access_token
//   3. fetchGoogleProfile()    -> call Google's userinfo endpoint with that
//                                 access_token to get a verified profile
//
// We fetch the userinfo endpoint rather than decoding the id_token
// ourselves: Google already authenticated the request over TLS during step
// 2 (using our client secret), so there's no need to also verify the
// id_token's JWS signature client-side — that would mean pulling in a
// JWKS-aware JWT library just for this one call.

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import {
  googleProfileSchema,
  googleTokenResponseSchema,
  type GoogleProfile,
  type GoogleTokenResponse,
} from '@/modules/auth/schemas';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

const GOOGLE_SCOPES = ['openid', 'email', 'profile'] as const;

/**
 * Thrown when the Google OAuth environment variables are not configured.
 * The route handler catches this and returns a 503 rather than crashing.
 */
export class GoogleOAuthNotConfiguredError extends Error {
  constructor() {
    super(
      'Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.',
    );
    this.name = 'GoogleOAuthNotConfiguredError';
  }
}

/**
 * Returns the Google OAuth credentials from env, or throws
 * GoogleOAuthNotConfiguredError if any required variable is absent.
 * Called at the start of each OAuth operation so misconfiguration is caught
 * at runtime on the first OAuth request, not at application startup.
 */
function requireGoogleCredentials(): {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
} {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    throw new GoogleOAuthNotConfiguredError();
  }
  return {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackUrl: env.GOOGLE_CALLBACK_URL,
  };
}

/** Builds the URL to send the browser to for the Google consent screen. */
export function buildGoogleAuthUrl(state: string): string {
  const { clientId, callbackUrl } = requireGoogleCredentials();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'online',
    prompt: 'select_account',
    // CSRF guard — the caller stashes this in a short-lived cookie and
    // compares it against what Google echoes back on the callback leg.
    state,
  });

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/** Exchanges the one-time authorization `code` for an access token. */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret, callbackUrl } = requireGoogleCredentials();

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    logger.error('Google token exchange failed', { status: response.status, body });
    throw new Error('Failed to exchange authorization code with Google');
  }

  const raw = await response.json();
  const parsed = googleTokenResponseSchema.safeParse(raw);

  if (!parsed.success) {
    logger.error('Unexpected Google token response shape', { issues: parsed.error.flatten() });
    throw new Error('Unexpected token response from Google');
  }

  return parsed.data;
}

/** Fetches the authenticated user's profile using a Google access token. */
export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    logger.error('Google userinfo request failed', { status: response.status });
    throw new Error('Failed to fetch Google profile');
  }

  const raw = await response.json();
  const parsed = googleProfileSchema.safeParse(raw);

  if (!parsed.success) {
    logger.error('Unexpected Google userinfo shape', { issues: parsed.error.flatten() });
    throw new Error('Unexpected profile response from Google');
  }

  if (!parsed.data.email_verified) {
    // Google lets a user register an account with an unverified email in
    // rare edge cases (e.g. some Workspace configurations) — don't let an
    // unverified address silently become a verified platform account.
    logger.warn('Google profile email is not verified', { email: parsed.data.email });
  }

  return parsed.data;
}
