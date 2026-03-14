import { OpenAPIHono } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import {
  getMeRoute,
  updatePreferencesRoute,
  getPracticeStateRoute,
  putPracticeStateRoute,
  updateProfileRoute,
  uploadAvatarRoute,
  deleteAvatarRoute,
  streamAvatarRoute,
} from './openapi.js';
import type { SessionResponse, PracticeState } from './dto.js';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { updateProfile } from './methods/update-profile.js';
import { uploadAvatar, streamAvatar, deleteAvatar } from './methods/avatar.js';
import { NotFoundException } from '../../utils/exceptions.js';

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
        image: dbUser?.image ? '/api/user/avatar/stream' : null,
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

// -- Profile --

user.openapi(updateProfileRoute, async (c) => {
  try {
    const { userId, email } = c.get('auth');
    const body = c.req.valid('json');
    const result = await updateProfile(userId, email, body);
    return c.json(result, 200);
  } catch (error) {
    logger.error({ error }, 'Error updating profile');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// -- Avatar --

user.openapi(uploadAvatarRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const body = await c.req.parseBody();
    const file = body.file as File;
    const result = await uploadAvatar(userId, file);
    return c.json(result, 200);
  } catch (error) {
    logger.error({ error }, 'Error uploading avatar');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

user.openapi(deleteAvatarRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    await deleteAvatar(userId);
    return c.body(null, 204);
  } catch (error) {
    logger.error({ error }, 'Error deleting avatar');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

user.openapi(streamAvatarRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { body, contentType } = await streamAvatar(userId);
    const buf = Buffer.from(body);

    return new Response(buf, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buf.byteLength),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error streaming avatar');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
