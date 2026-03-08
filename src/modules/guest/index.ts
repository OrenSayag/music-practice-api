import { OpenAPIHono } from '@hono/zod-openapi';
import { setCookie } from 'hono/cookie';
import { guestLoginRoute } from './openapi.js';
import { guestLogin } from './methods/guest-login.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config.js';

export const guest = new OpenAPIHono();

guest.openapi(guestLoginRoute, async (c) => {
  try {
    const body = c.req.valid('json');
    const { response, sessionToken } = await guestLogin(body);

    setCookie(c, 'authjs.session-token', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: config.server.isProduction,
      sameSite: 'Lax',
      maxAge: config.auth.sessionMaxAgeSeconds,
    });

    return c.json(response, 200);
  } catch (error) {
    logger.error({ error }, 'Error during guest login');
    return c.json({ error: 'Failed to create guest session' }, 500);
  }
});
