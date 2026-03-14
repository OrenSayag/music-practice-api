import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import {
  listAllRecordingsQuerySchema,
  listAllRecordingsResponseSchema,
  toggleStarResponseSchema,
  errorResponseSchema,
} from './dto.js';

export const listAllRecordingsRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: listAllRecordingsQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: listAllRecordingsResponseSchema,
        },
      },
      description: 'Paginated list of all recordings',
    },
    500: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['Recordings'],
  summary: 'List all recordings',
  description:
    'Returns a paginated list of all recordings across sessions, with optional starred and tag filters',
});

export const toggleStarRoute = createRoute({
  method: 'patch',
  path: '/{recordingId}/star',
  request: {
    params: z.object({
      recordingId: z.string().openapi({ example: 'recording-uuid' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: toggleStarResponseSchema,
        },
      },
      description: 'Star toggled',
    },
    404: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'Recording not found',
    },
    500: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['Recordings'],
  summary: 'Toggle recording star',
  description: 'Toggles the starred status of a recording',
});
