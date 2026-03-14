import { OpenAPIHono } from '@hono/zod-openapi';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { NotFoundException } from '../../utils/exceptions.js';
import {
  listSessionsRoute,
  getSessionRoute,
  deleteSessionRoute,
  startSessionRoute,
  endSessionRoute,
  saveSessionItemsRoute,
  getSessionTagsRoute,
  linkSessionTagRoute,
  unlinkSessionTagRoute,
  uploadRecordingRoute,
  listRecordingsRoute,
  streamRecordingRoute,
  deleteRecordingRoute,
  updateRecordingRoute,
} from './openapi.js';
import { listSessions } from './methods/list-sessions.js';
import { getSession } from './methods/get-session.js';
import { deleteSession } from './methods/delete-session.js';
import { startSession } from './methods/start-session.js';
import { endSession } from './methods/end-session.js';
import { saveSessionItems } from './methods/save-session-items.js';
import {
  getSessionTags,
  linkSessionTag,
  unlinkSessionTag,
} from './methods/session-tags.js';
import {
  uploadRecording,
  listRecordings,
  streamRecording,
  deleteRecording,
  updateRecording,
} from './methods/recordings.js';

type Variables = { auth: AuthContext };

export const sessions = new OpenAPIHono<{ Variables: Variables }>();

sessions.openapi(listSessionsRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const result = await listSessions(userId);
    return c.json(result, 200);
  } catch (error) {
    logger.error({ error }, 'Error listing sessions');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(getSessionRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId } = c.req.valid('param');
    const session = await getSession(userId, sessionId);
    return c.json(session, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error getting session');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(deleteSessionRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId } = c.req.valid('param');
    await deleteSession(userId, sessionId);
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error deleting session');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

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

// -- Session Recordings --

sessions.openapi(uploadRecordingRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId } = c.req.valid('param');
    const body = await c.req.parseBody();
    const file = body.file as File;
    const durationSeconds = Number(body.durationSeconds) || 0;
    const recording = await uploadRecording(userId, sessionId, file, durationSeconds);
    return c.json(recording, 201);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error uploading recording');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(listRecordingsRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId } = c.req.valid('param');
    const recordings = await listRecordings(userId, sessionId);
    return c.json(recordings, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error listing recordings');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(streamRecordingRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId, recordingId } = c.req.valid('param');
    const { body, contentType, fileSize } = await streamRecording(userId, sessionId, recordingId);
    const buf = Buffer.from(body);
    const rangeHeader = c.req.header('range');

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : buf.byteLength - 1;
        const chunk = buf.subarray(start, end + 1);
        return new Response(chunk, {
          status: 206,
          headers: {
            'Content-Type': contentType,
            'Content-Length': String(chunk.byteLength),
            'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
            'Accept-Ranges': 'bytes',
          },
        });
      }
    }

    return new Response(buf, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error streaming recording');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(deleteRecordingRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId, recordingId } = c.req.valid('param');
    await deleteRecording(userId, sessionId, recordingId);
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error deleting recording');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

sessions.openapi(updateRecordingRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sessionId, recordingId } = c.req.valid('param');
    const { fileName } = c.req.valid('json');
    const recording = await updateRecording(userId, sessionId, recordingId, fileName);
    return c.json(recording, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error updating recording');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
