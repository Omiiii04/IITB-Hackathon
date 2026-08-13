import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.string().transform((val) => {
    const v = val.toLowerCase().trim();
    if (v === 'production' || v === 'prod') return 'production';
    if (v === 'test') return 'test';
    return 'development';
  }).default('development'),
  PORT: z.string().default('3000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // PostgreSQL Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required').default('postgresql://localhost:5432/ecommerce_db'),
  DIRECT_URL: z.string().optional(),

  // JWT Secrets — accept any valid non-empty string with safe fallback
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required').default('default_jwt_access_secret_for_development_mode_only!'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required').default('default_jwt_refresh_secret_for_development_mode_only!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth 2.0
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // Razorpay Gateway (primary and sole payment provider)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Cloudinary Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // AI Integration
  AI_PROVIDER: z.enum(['gemini', 'openai']).default('gemini'),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function getValidatedEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parseResult = envSchema.safeParse(process.env);

  if (!parseResult.success) {
    console.warn('⚠️ Environment variable validation warnings:', parseResult.error.format());

    // During build or runtime fallback, provide a sanitized fallback object so the server NEVER crashes
    cachedEnv = envSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'fallback_jwt_access_secret_min_16_chars',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_min_16_chars',
    });
    return cachedEnv;
  }

  cachedEnv = parseResult.data;
  return cachedEnv;
}

export const env = new Proxy({} as Env, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;
    return getValidatedEnv()[prop as keyof Env];
  },
});