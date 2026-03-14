import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import {
  startSessionResponseSchema,
  endSessionRequestSchema,
  endSessionResponseSchema,
  saveSessionItemsRequestSchema,
  saveSessionItemsResponseSchema,
  linkTagRequestSchema,
  sessionTagsResponseSchema,
  recordingResponseSchema,
  recordingsListResponseSchema,
  updateRecordingRequestSchema,
  listSessionsQuerySchema,
  listSessionsResponseSchema,
  sessionDetailResponseSchema,
  activeSessionResponseSchema,
  errorResponseSchema,
} from './dto.js';

export const listSessionsRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: listSessionsQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: listSessionsResponseSchema },
      },
      description: 'List of sessions with stats',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'List all practice sessions',
});

export const getSessionRoute = createRoute({
  method: 'get',
  path: '/{sessionId}',
  request: {
    params: z.object({ sessionId: z.string() }),
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: sessionDetailResponseSchema },
      },
      description: 'Session detail',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Session not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'Get session detail',
});

export const deleteSessionRoute = createRoute({
  method: 'delete',
  path: '/{sessionId}',
  request: {
    params: z.object({ sessionId: z.string() }),
  },
  responses: {
    204: {
      description: 'Session deleted',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Session not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'Delete a session and its recordings',
});

export const getActiveSessionRoute = createRoute({
  method: 'get',
  path: '/active',
  responses: {
    200: {
      content: {
        'application/json': { schema: activeSessionResponseSchema },
      },
      description: 'Active session or null',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'Get the currently active practice session',
});

export const cancelSessionRoute = createRoute({
  method: 'delete',
  path: '/{sessionId}/cancel',
  request: {
    params: z.object({ sessionId: z.string() }),
  },
  responses: {
    204: {
      description: 'Session cancelled and deleted',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Session not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'Cancel an active session (deletes it)',
});

export const startSessionRoute = createRoute({
  method: 'post',
  path: '/',
  responses: {
    201: {
      content: {
        'application/json': { schema: startSessionResponseSchema },
      },
      description: 'Session started',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'Start a practice session',
});

export const endSessionRoute = createRoute({
  method: 'patch',
  path: '/{sessionId}',
  request: {
    params: z.object({ sessionId: z.string() }),
    body: {
      content: {
        'application/json': { schema: endSessionRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: endSessionResponseSchema },
      },
      description: 'Session ended',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Session not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'End a practice session',
});

export const saveSessionItemsRoute = createRoute({
  method: 'post',
  path: '/{sessionId}/items',
  request: {
    params: z.object({ sessionId: z.string() }),
    body: {
      content: {
        'application/json': { schema: saveSessionItemsRequestSchema },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': { schema: saveSessionItemsResponseSchema },
      },
      description: 'Items saved',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Session not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'Bulk save session items',
});

// -- Session Tag Linking --

export const getSessionTagsRoute = createRoute({
  method: 'get',
  path: '/{sessionId}/tags',
  request: {
    params: z.object({ sessionId: z.string() }),
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: sessionTagsResponseSchema },
      },
      description: 'Tags linked to this session',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Session not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'Get tags linked to a session',
});

export const linkSessionTagRoute = createRoute({
  method: 'post',
  path: '/{sessionId}/tags',
  request: {
    params: z.object({ sessionId: z.string() }),
    body: {
      content: {
        'application/json': { schema: linkTagRequestSchema },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': { schema: sessionTagsResponseSchema },
      },
      description: 'Tag linked',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Session or tag not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'Link a tag to a session',
});

export const unlinkSessionTagRoute = createRoute({
  method: 'delete',
  path: '/{sessionId}/tags/{tagId}',
  request: {
    params: z.object({ sessionId: z.string(), tagId: z.string() }),
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: sessionTagsResponseSchema },
      },
      description: 'Tag unlinked',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Sessions'],
  summary: 'Unlink a tag from a session',
});

// -- Session Recordings --

export const uploadRecordingRoute = createRoute({
  method: 'post',
  path: '/{sessionId}/recordings',
  request: {
    params: z.object({ sessionId: z.string() }),
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.any().openapi({ type: 'string', format: 'binary' }),
            durationSeconds: z.string().openapi({ example: '120' }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': { schema: recordingResponseSchema },
      },
      description: 'Recording uploaded',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Session not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Recordings'],
  summary: 'Upload a recording for a session',
});

export const listRecordingsRoute = createRoute({
  method: 'get',
  path: '/{sessionId}/recordings',
  request: {
    params: z.object({ sessionId: z.string() }),
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: recordingsListResponseSchema },
      },
      description: 'List of recordings',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Session not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Recordings'],
  summary: 'List recordings for a session',
});

export const streamRecordingRoute = createRoute({
  method: 'get',
  path: '/{sessionId}/recordings/{recordingId}/stream',
  request: {
    params: z.object({ sessionId: z.string(), recordingId: z.string() }),
  },
  responses: {
    200: {
      description: 'Audio stream',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Recording not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Recordings'],
  summary: 'Stream a recording audio file',
});

export const deleteRecordingRoute = createRoute({
  method: 'delete',
  path: '/{sessionId}/recordings/{recordingId}',
  request: {
    params: z.object({ sessionId: z.string(), recordingId: z.string() }),
  },
  responses: {
    204: {
      description: 'Recording deleted',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Recording not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Recordings'],
  summary: 'Delete a recording',
});

export const updateRecordingRoute = createRoute({
  method: 'patch',
  path: '/{sessionId}/recordings/{recordingId}',
  request: {
    params: z.object({ sessionId: z.string(), recordingId: z.string() }),
    body: {
      content: {
        'application/json': { schema: updateRecordingRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: recordingResponseSchema },
      },
      description: 'Recording updated',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Recording not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Recordings'],
  summary: 'Update a recording name',
});
