/**
 * Health Check Handler
 *
 * Pings every downstream service and aggregates status.
 */

import { Request, Response } from 'express';
import http from 'http';
import https from 'https';
import { SERVICES } from '../config/services';

interface ServiceHealth {
  name: string;
  url: string;
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

function ping(url: string): Promise<{ ok: boolean; ms: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      res.resume();
      resolve({ ok: res.statusCode !== undefined && res.statusCode < 500, ms: Date.now() - start });
    });
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ ok: false, ms: Date.now() - start });
    });
    req.on('error', () => resolve({ ok: false, ms: Date.now() - start }));
  });
}

export async function healthHandler(_req: Request, res: Response) {
  const checks = await Promise.all(
    Object.values(SERVICES).map(async (svc): Promise<ServiceHealth> => {
      const result = await ping(`${svc.url}${svc.healthPath}`);
      return {
        name: svc.name,
        url: svc.url,
        status: result.ok ? 'up' : 'down',
        responseTime: result.ms,
      };
    }),
  );

  const allUp = checks.every((c) => c.status === 'up');

  res.status(allUp ? 200 : 207).json({
    gateway: 'api-gateway',
    status: allUp ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: checks,
  });
}
