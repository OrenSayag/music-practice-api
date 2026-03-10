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
  errorResponseSchema,
} from './dto.js';

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
