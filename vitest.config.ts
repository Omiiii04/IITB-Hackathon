import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    // Load .env.test.example (renamed to .env.test) or fall back to .env for unit tests.
    // Vitest picks up dotenv automatically when env files are listed here.
    env: {
      // Inline the Razorpay test sandbox keys so unit tests work without
      // requiring a .env.test file on disk in CI.
      RAZORPAY_KEY_ID: 'rzp_test_TOpjIBZoFFGKH4',
      RAZORPAY_KEY_SECRET: 'J5JDijw7oJ4rXkHAgsUbFCm7',
      RAZORPAY_WEBHOOK_SECRET: 'rd3Vf5resnJQ@7f',
      // Minimal stubs required by src/lib/env.ts to avoid validation failure
      DATABASE_URL: 'postgresql://dummy:dummy@localhost:5432/dummy',
      JWT_ACCESS_SECRET: 'test-access-secret-32-chars-long-',
      JWT_REFRESH_SECRET: 'test-refresh-secret-32-chars-long',
      NODE_ENV: 'test',
      SKIP_ENV_VALIDATION: '1',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
