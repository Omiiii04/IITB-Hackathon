import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { GoogleProfile, RegisterInput } from '@/modules/auth/schemas';
import type { AuthUser, Role } from '@/types';

// FR-1.2: passwords hashed with Argon2id prior to persistence. OWASP's
// baseline cost params (m=19MiB, t=2, p=1) — tune upward if server memory
// allows; hashing cost is a one-time cost per register/login, not a hot path.
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} satisfies argon2.Options & { raw?: false };

export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, ARGON2_OPTIONS);
}

// Never throws on a malformed/foreign hash — returns false so callers can
// treat "verify failed" and "verify errored" identically without leaking
// which case occurred.
export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    return false;
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`An account with email "${email}" already exists`);
    this.name = 'EmailAlreadyExistsError';
  }
}

// FR-1.1 / FR-1.2: native email/password registration.
// Throws EmailAlreadyExistsError on collision — deliberately doesn't reveal
// whether the existing account is password-based or OAuth-only (FR-1.5),
// so the route handler can return one generic message either way.
export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new EmailAlreadyExistsError(input.email);
  }

  const passwordHash = await hashPassword(input.password);

  const created = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
    },
  });

  logger.info('Registered new email/password account', { userId: created.id, role: created.role });
  return toAuthUser(created);
}

// Create-or-link the platform User row for a verified Google identity
// (FR-1.1). Called from the OAuth callback in
// app/api/auth/oauth/google/route.ts once a profile has been fetched.
//
//  - No existing user with this email  -> create a new OAuth-only account.
//    passwordHash is left null (FR-1.5) — password login is rejected for
//    these accounts elsewhere (in the email/password login route, added in
//    a later commit).
//  - Existing email/password account   -> link the Google identity to it
//    (oauthProvider/oauthId set) without touching passwordHash, so the user
//    keeps both login paths available.
//  - Existing OAuth account            -> return it as-is.
export async function findOrCreateGoogleUser(profile: GoogleProfile): Promise<AuthUser> {
  const existing = await prisma.user.findUnique({ where: { email: profile.email } });

  if (existing) {
    if (!existing.oauthId) {
      const linked = await prisma.user.update({
        where: { id: existing.id },
        data: {
          oauthProvider: 'GOOGLE',
          oauthId: profile.sub,
          // Fill in name/avatar only if the existing account doesn't have
          // one yet — never clobber something the user already set.
          name: existing.name ?? profile.name,
          avatarUrl: existing.avatarUrl ?? profile.picture,
          // Google already verified this address, so an existing
          // unverified email/password account can be upgraded — but never
          // downgrade an already-verified account.
          isEmailVerified: existing.isEmailVerified || profile.email_verified,
        },
      });
      logger.info('Linked Google identity to existing account', { userId: linked.id });
      return toAuthUser(linked);
    }

    return toAuthUser(existing);
  }

  const created = await prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
      passwordHash: null,
      oauthProvider: 'GOOGLE',
      oauthId: profile.sub,
      isEmailVerified: profile.email_verified,
      role: 'CUSTOMER',
    },
  });

  logger.info('Created new OAuth-only account via Google', { userId: created.id });
  return toAuthUser(created);
}

function toAuthUser(user: { id: string; email: string; role: string }): AuthUser {
  return { id: user.id, email: user.email, role: user.role as Role };
}
