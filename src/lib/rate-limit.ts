export interface RateLimitInfo {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitInfo>();

/**
 * A simple in-memory rate limiter suitable for a single-node deployment.
 * For serverless or multi-node environments, this should be replaced with a Redis-backed solution.
 */
export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const info = store.get(ip) || { count: 0, resetAt: now + windowMs };
  
  if (now > info.resetAt) {
    info.count = 1;
    info.resetAt = now + windowMs;
  } else {
    info.count++;
  }
  
  store.set(ip, info);
  
  // Occasional cleanup of expired entries to prevent memory leaks
  if (Math.random() < 0.05) {
    for (const [key, val] of store.entries()) {
      if (now > val.resetAt) store.delete(key);
    }
  }

  return info.count <= limit;
}
