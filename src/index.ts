import { config } from './config.js';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { OpenAPIHono } from '@hono/zod-openapi';
import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { compress } from 'hono/compress';
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

const api = new OpenAPIHono().basePath('/api');

// Global middleware
api.use(
  '*',
  cors({
    origin: [config.server.frontendUrl],
    credentials: true,
  })
);
api.use('*', globalRateLimiter);
api.use('*', initAuth);

// Public routes
api.route('/health', health);
api.route('/auth', auth);
api.route('/guest', guest);

// Protected routes
api.use('/user/*', requireAuth());
api.route('/user', user);

api.use('/dashboard/*', requireAuth());
api.use('/dashboard', requireAuth());
api.route('/dashboard', dashboard);

api.use('/plans/*', requireAuth());
api.use('/plans', requireAuth());
api.route('/plans', plans);

api.use('/chat/*', requireAuth());
api.use('/chat', requireAuth());
api.route('/chat', chat);

api.use('/presets/*', requireAuth());
api.use('/presets', requireAuth());
api.route('/presets', presets);

api.use('/sessions/*', requireAuth());
api.use('/sessions', requireAuth());
api.route('/sessions', sessions);

api.use('/tags/*', requireAuth());
api.use('/tags', requireAuth());
api.route('/tags', tags);

api.use('/recordings/*', requireAuth());
api.use('/recordings', requireAuth());
api.route('/recordings', recordings);

// Auth.js built-in routes (handles /api/auth/session, /api/auth/callback, etc.)
api.use('/auth/*', authHandler());

// OpenAPI docs (development only)
if (!config.server.isProduction) {
  api.doc('/doc', {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'Music Practice API',
      description: 'Music Practice API with Google OAuth authentication',
    },
  });
  api.get('/ui', swaggerUI({ url: '/api/doc' }));
}

// Root app — serves API and static UI assets
const app = new Hono();
app.use('*', compress());
app.route('/', api);

// Static file serving for UI (production)
app.use('*', serveStatic({ root: './public' }));
// SPA fallback — serve index.html for client-side routes
app.use('*', serveStatic({ root: './public', path: 'index.html' }));

serve({ fetch: app.fetch, port: config.server.port }, (info) => {
  logger.info({ port: info.port }, 'Server is running');
  if (!config.server.isProduction) {
    logger.info(
      { url: `http://localhost:${info.port}/api/ui` },
      'Swagger UI available'
    );
  }
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
