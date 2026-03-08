import { OpenAPIHono } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import { getMeRoute } from './openapi.js';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';

type Variables = { auth: AuthContext };

export const user = new OpenAPIHono<{ Variables: Variables }>();

user.openapi(getMeRoute, async (c) => {
  try {
    const { userId, email } = c.get('auth');

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return c.json({
      user: {
        id: userId,
        email: email || null,
        firstName: dbUser?.firstName || null,
        lastName: dbUser?.lastName || null,
        image: dbUser?.image || null,
        isGuest: dbUser?.isGuest || false,
      },
    }, 200);
  } catch (error) {
    logger.error({ error }, 'Error getting current user');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
