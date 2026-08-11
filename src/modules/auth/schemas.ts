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

// FR-1.1 / FR-1.2: native email/password registration.
// Self-registration limited to CUSTOMER / SELLER — DELIVERY isn't a separate
// login surface in the MVP, ADMIN is provisioned out of band.
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[0-9]/, 'Password must include a number'),
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
