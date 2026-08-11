import { z } from 'zod';

// Shape of Google's OAuth 2.0 userinfo response
// (https://www.googleapis.com/oauth2/v3/userinfo), validated before any of
// it is trusted elsewhere in the app. Only the fields this app reads are
// declared — Zod ignores the rest.
export const googleProfileSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  email_verified: z.boolean().optional().default(false),
  name: z.string().optional(),
  picture: z.string().url().optional(),
});

export type GoogleProfile = z.infer<typeof googleProfileSchema>;

// Google's token-endpoint response (RFC 6749 §5.1), narrowed to the fields
// this app reads.
export const googleTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number(),
  token_type: z.string(),
  scope: z.string(),
  id_token: z.string().optional(),
});

export type GoogleTokenResponse = z.infer<typeof googleTokenResponseSchema>;