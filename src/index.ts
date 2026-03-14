import { config } from './config.js';
import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { initAuth, authHandler } from './middleware/auth.js';
import { globalRateLimiter } from './middleware/rate-limit.js';
import { auth } from './modules/auth/index.js';
import { user } from './modules/user/index.js';
import { health } from './modules/health/index.js';
import { guest } from './modules/guest/index.js';
import { dashboard } from './modules/dashboard/index.js';
import { plans } from './modules/plans/index.js';
import { chat } from './modules/chat/index.js';
import { presets } from './modules/presets/index.js';
import { sessions } from './modules/sessions/index.js';
import { tags } from './modules/tags/index.js';
import { recordings } from './modules/recordings/index.js';
import { requireAuth } from './middleware/require-auth.js';
import { logger } from './utils/logger.js';
import { ensureBucket } from './lib/storage.js';

const app = new OpenAPIHono().basePath('/api');

// Global middleware
app.use(
  '*',
  cors({
    origin: [config.server.frontendUrl],
    credentials: true,
  })
);
app.use('*', globalRateLimiter);
app.use('*', initAuth);

// Public routes
app.route('/health', health);
app.route('/auth', auth);
app.route('/guest', guest);

// Protected routes
app.use('/user/*', requireAuth());
app.route('/user', user);

app.use('/dashboard/*', requireAuth());
app.use('/dashboard', requireAuth());
app.route('/dashboard', dashboard);

app.use('/plans/*', requireAuth());
app.use('/plans', requireAuth());
app.route('/plans', plans);

app.use('/chat/*', requireAuth());
app.use('/chat', requireAuth());
app.route('/chat', chat);

app.use('/presets/*', requireAuth());
app.use('/presets', requireAuth());
app.route('/presets', presets);

app.use('/sessions/*', requireAuth());
app.use('/sessions', requireAuth());
app.route('/sessions', sessions);

app.use('/tags/*', requireAuth());
app.use('/tags', requireAuth());
app.route('/tags', tags);

app.use('/recordings/*', requireAuth());
app.use('/recordings', requireAuth());
app.route('/recordings', recordings);

// Auth.js built-in routes (handles /api/auth/session, /api/auth/callback, etc.)
app.use('/auth/*', authHandler());

// OpenAPI docs
app.doc('/doc', {
  openapi: '3.1.0',
  info: {
    version: '1.0.0',
    title: 'Music Practice API',
    description: 'Music Practice API with magic link authentication',
  },
});
app.get('/ui', swaggerUI({ url: '/api/doc' }));

serve({ fetch: app.fetch, port: config.server.port }, (info) => {
  logger.info({ port: info.port }, 'Server is running');
  logger.info(
    { url: `http://localhost:${info.port}/api/ui` },
    'Swagger UI available'
  );
});

// Ensure S3 bucket exists (retry in background — network may not be ready yet)
ensureBucket().catch((error) => {
  logger.warn({ error }, 'Initial S3 bucket check failed, retrying in 10s');
  setTimeout(() => {
    ensureBucket().catch((retryError) => {
      logger.error({ error: retryError }, 'S3 bucket check failed after retry');
    });
  }, 10_000);
});
