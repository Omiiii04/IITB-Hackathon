import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('should return health status response with status code 200 or 503', async () => {
    const response = await GET();
    const data = await response.json();

    expect([200, 503]).toContain(response.status);
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('service', 'MarketHub Multi-Vendor E-Commerce Platform');
    expect(data).toHaveProperty('version', '0.1.0');
    expect(data).toHaveProperty('checks');
    expect(data.checks).toHaveProperty('database');
    expect(data).toHaveProperty('metrics');
    expect(response.headers.get('cache-control')).toBe('no-store, max-age=0');
  });
});
