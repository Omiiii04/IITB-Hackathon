import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // PostgreSQL Database — no default; must be explicitly supplied in every
  // environment. A missing DATABASE_URL is a misconfiguration we want to
  // surface immediately at startup, not silently fall back to dev credentials.
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  // JWT Secrets — must be explicitly set; no defaults to prevent accidental
  // weak-key deployments.
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google OAuth 2.0 — optional at the schema level so the application can
  // start (and pass CI) without Google credentials. The OAuth route handler
  // checks for these at runtime and returns a 503 if they are absent, keeping
  // a clear error instead of a startup crash in non-OAuth environments.
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

function getValidatedEnv(): Env {
  const isBuildPhase =
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build' ||
    process.env.SKIP_ENV_VALIDATION === '1' ||
    process.env.SKIP_ENV_VALIDATION === 'true';

  const parseResult = envSchema.safeParse(process.env);

  if (!parseResult.success) {
    if (isBuildPhase) {
      // During Next.js page data collection / static route analysis at build time,
      // fallback to dummy placeholders so docker build doesn't require runtime secrets.
      return envSchema.parse({
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'build_dummy_access_secret_min_32_chars!',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'build_dummy_refresh_secret_min_32_chars!',
      });
    }

    console.error('❌ Invalid environment variables:', parseResult.error.format());
    throw new Error('Invalid environment variables');
  }

  return parseResult.data;
}

export const env = new Proxy({} as Env, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;
    return getValidatedEnv()[prop as keyof Env];
  },
});