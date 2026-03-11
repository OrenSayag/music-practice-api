import { OpenAPIHono } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import { getMeRoute, updatePreferencesRoute, getPracticeStateRoute, putPracticeStateRoute } from './openapi.js';
import type { SessionResponse, PracticeState } from './dto.js';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';

type MetronomeSound = SessionResponse['user']['metronomeSound'];

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
        weekStartDay: dbUser?.weekStartDay ?? 0,
        metronomeSound: (dbUser?.metronomeSound ?? 'wood') as MetronomeSound,
      },
    }, 200);
  } catch (error) {
    logger.error({ error }, 'Error getting current user');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

user.openapi(updatePreferencesRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const body = c.req.valid('json');

    const updateData: Record<string, unknown> = {};
    if (body.weekStartDay !== undefined) updateData.weekStartDay = body.weekStartDay;
    if (body.metronomeSound !== undefined) updateData.metronomeSound = body.metronomeSound;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId));
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return c.json({
      weekStartDay: dbUser?.weekStartDay ?? 0,
      metronomeSound: (dbUser?.metronomeSound ?? 'wood') as MetronomeSound,
    }, 200);
  } catch (error) {
    logger.error({ error }, 'Error updating preferences');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

user.openapi(getPracticeStateRoute, async (c) => {
  try {
    const { userId } = c.get('auth');

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { practiceState: true },
    });

    return c.json({
      practiceState: (dbUser?.practiceState as PracticeState) ?? null,
    }, 200);
  } catch (error) {
    logger.error({ error }, 'Error getting practice state');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

user.openapi(putPracticeStateRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const body = c.req.valid('json');

    await db
      .update(users)
      .set({ practiceState: body })
      .where(eq(users.id, userId));

    return c.json({ practiceState: body }, 200);
  } catch (error) {
    logger.error({ error }, 'Error saving practice state');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
