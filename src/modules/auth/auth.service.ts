import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { GoogleProfile } from '@/modules/auth/schemas';
import type { AuthUser, Role } from '@/types';

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
