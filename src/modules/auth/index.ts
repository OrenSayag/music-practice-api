import { OpenAPIHono } from '@hono/zod-openapi';
import { loginRoute } from './openapi.js';
import { requestMagicLink } from './methods/request-magic-link.js';
import { UnauthenticatedException } from '../../utils/exceptions.js';
import { magicLinkRateLimiter } from '../../middleware/rate-limit.js';
import { config } from '../../config.js';
import { logger } from '../../utils/logger.js';

export const auth = new OpenAPIHono();

auth.use('/login', magicLinkRateLimiter);

auth.openapi(loginRoute, async (c) => {
  try {
    const body = c.req.valid('json');
    const internalApiUrl = `http://localhost:${config.server.port}`;
    const result = await requestMagicLink(body, internalApiUrl, config.server.frontendUrl);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof UnauthenticatedException) {
      return c.json({ error: error.message }, 401);
    }
    logger.error({ error }, 'Error requesting magic link');
    return c.json({ error: 'Failed to send magic link' }, 500);
  }
});
