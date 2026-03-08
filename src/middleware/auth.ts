import { initAuthConfig, verifyAuth, authHandler } from '@hono/auth-js';
import { getAuthConfig } from '../auth.js';
import { config } from '../config.js';

export { verifyAuth, authHandler };

export const initAuth = initAuthConfig(() => ({
  ...getAuthConfig(),
  secret: config.auth.secret,
}));
