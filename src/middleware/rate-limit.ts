import { rateLimiter } from 'hono-rate-limiter';
import type { Context } from 'hono';
import { config } from '../config.js';

const tooManyRequestsHandler = () =>
  new Response(JSON.stringify({ error: 'Too many requests' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
  });

const ipKeyGenerator = (c: Context) =>
  c.req.header('x-forwarded-for') ||
  c.req.header('x-real-ip') ||
  'unknown';

export const globalRateLimiter = rateLimiter({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.maxRequests,
  keyGenerator: ipKeyGenerator,
  handler: tooManyRequestsHandler,
});

