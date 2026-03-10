import { OpenAPIHono } from '@hono/zod-openapi';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { NotFoundException } from '../../utils/exceptions.js';
import {
  listTagsRoute,
  createTagRoute,
  updateTagRoute,
  deleteTagRoute,
} from './openapi.js';
import {
  listTags,
  createTag,
  updateTag,
  deleteTag,
} from './methods/tag-crud.js';

type Variables = { auth: AuthContext };

export const tags = new OpenAPIHono<{ Variables: Variables }>();

tags.openapi(listTagsRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const result = await listTags(userId);
    return c.json(result, 200);
  } catch (error) {
    logger.error({ error }, 'Error listing tags');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

tags.openapi(createTagRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const body = c.req.valid('json');
    const tag = await createTag(userId, body);
    return c.json(tag, 201);
  } catch (error) {
    logger.error({ error }, 'Error creating tag');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

tags.openapi(updateTagRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { tagId } = c.req.valid('param');
    const body = c.req.valid('json');
    const tag = await updateTag(userId, tagId, body);
    return c.json(tag, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error updating tag');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

tags.openapi(deleteTagRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { tagId } = c.req.valid('param');
    await deleteTag(userId, tagId);
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error deleting tag');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
