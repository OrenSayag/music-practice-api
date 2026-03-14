import { OpenAPIHono } from '@hono/zod-openapi';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { NotFoundException } from '../../utils/exceptions.js';
import { listAllRecordingsRoute, toggleStarRoute } from './openapi.js';
import { listAllRecordings } from './methods/list-all-recordings.js';
import { toggleStar } from './methods/toggle-star.js';

type Variables = {
  auth: AuthContext;
};

export const recordings = new OpenAPIHono<{ Variables: Variables }>();

// GET / — paginated list of all recordings
recordings.openapi(listAllRecordingsRoute, async (c) => {
  try {
    const { auth } = c.var;
    const query = c.req.valid('query');
    const result = await listAllRecordings({
      userId: auth.userId,
      cursor: query.cursor,
      limit: query.limit,
      starred: query.starred === 'true' ? true : undefined,
      tagId: query.tagId,
    });
    return c.json(result, 200);
  } catch (error) {
    logger.error({ error }, 'Error listing recordings');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// PATCH /:recordingId/star — toggle star
recordings.openapi(toggleStarRoute, async (c) => {
  try {
    const { auth } = c.var;
    const { recordingId } = c.req.valid('param');
    const result = await toggleStar(auth.userId, recordingId);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error toggling star');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
