// start.js - deterministic production entrypoint for Railway and Docker containers
const { execSync } = require('child_process');

const port = process.env.PORT || '3000';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const nodeEnv = process.env.NODE_ENV || 'development';

console.log(`[Startup] Initializing application container...`);
console.log(`[Startup] Environment: NODE_ENV=${nodeEnv}, HOSTNAME=${hostname}, PORT=${port}`);

try {
  console.log('[Startup] Executing Prisma migrate deploy...');
  execSync('node node_modules/prisma/build/index.js migrate deploy', { stdio: 'inherit' });
  console.log('[Startup] Prisma migrate deploy completed successfully.');
} catch (error) {
  console.warn('[Startup] Prisma migration step encountered an error or was skipped, proceeding with server startup:', error.message);
}

console.log(`[Startup] Starting Next.js standalone server on ${hostname}:${port}...`);
require('./server.js');
