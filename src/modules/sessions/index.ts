import { OpenAPIHono } from '@hono/zod-openapi';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { NotFoundException } from '../../utils/exceptions.js';
import {
  startSessionRoute,
  endSessionRoute,
  saveSessionItemsRoute,
  getSessionTagsRoute,
  linkSessionTagRoute,
  unlinkSessionTagRoute,
} from './openapi.js';
import { startSession } from './methods/start-session.js';
import { endSession } from './methods/end-session.js';
import { saveSessionItems } from './methods/save-session-items.js';
import {
  getSessionTags,
  linkSessionTag,
  unlinkSessionTag,
} from './methods/session-tags.js';

type Variables = { auth: AuthContext };

export const sessions = new OpenAPIHono<{ Variables: Variables }>();

sessions.openapi(startSessionRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const session = await startSession(userId);
    return c.json(session, 201);
  } catch (error) {
    logger.error({ error }, 'Error starting session');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(endSessionRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId } = c.req.valid('param');
    const body = c.req.valid('json');
    const session = await endSession(userId, sessionId, body);
    return c.json(session, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error ending session');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(saveSessionItemsRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await saveSessionItems(userId, sessionId, body);
    return c.json(result, 201);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error saving session items');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// -- Session Tag Linking --

sessions.openapi(getSessionTagsRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId } = c.req.valid('param');
    const tags = await getSessionTags(userId, sessionId);
    return c.json(tags, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error fetching session tags');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(linkSessionTagRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId } = c.req.valid('param');
    const { tagId } = c.req.valid('json');
    const tags = await linkSessionTag(userId, sessionId, tagId);
    return c.json(tags, 201);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error linking session tag');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(unlinkSessionTagRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId, tagId } = c.req.valid('param');
    const tags = await unlinkSessionTag(userId, sessionId, tagId);
    return c.json(tags, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error unlinking session tag');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
