import { OpenAPIHono } from '@hono/zod-openapi';
import { setCookie } from 'hono/cookie';
import { guestLoginRoute, guestLimitsRoute } from './openapi.js';
import { guestLogin } from './methods/guest-login.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config.js';
import { GuestLimitExceededException } from '../../utils/exceptions.js';

export const guest = new OpenAPIHono();

guest.openapi(guestLoginRoute, async (c) => {
  try {
    const body = c.req.valid('json');
    const { response, sessionToken } = await guestLogin(body);

    const cookieName = config.server.isProduction
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token';

    setCookie(c, cookieName, sessionToken, {
      path: '/',
      httpOnly: true,
      secure: config.server.isProduction,
      sameSite: 'Lax',
      maxAge: config.auth.sessionMaxAgeSeconds,
    });

    return c.json(response, 200);
  } catch (error) {
    if (error instanceof GuestLimitExceededException) {
      return c.json({ error: error.message, code: error.code }, 403);
    }
    logger.error({ error }, 'Error during guest login');
    return c.json({ error: 'Failed to create guest session' }, 500);
  }
});

guest.openapi(guestLimitsRoute, async (c) => {
  return c.json({
    maxRecordings: config.guest.maxRecordings,
    maxChatMessagesPerDay: config.guest.maxChatMessagesPerDay,
  }, 200);
});
