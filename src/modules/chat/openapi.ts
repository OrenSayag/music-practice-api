import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import {
  chatMessageSchema,
  chatStreamRequestSchema,
  errorResponseSchema,
} from './dto.js';

export const streamChatRoute = createRoute({
  method: 'post',
  path: '/stream',
  request: {
    body: {
      content: {
        'application/json': {
          schema: chatStreamRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Streamed AI response (text/event-stream)',
    },
    400: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'No user message provided',
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
  tags: ['Chat'],
  summary: 'Stream chat response',
  description:
    'Send messages and receive a streamed AI response with practice plan context',
});

export const getHistoryRoute = createRoute({
  method: 'get',
  path: '/history',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(chatMessageSchema),
        },
      },
      description: 'Chat message history',
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
  tags: ['Chat'],
  summary: 'Get chat history',
  description: 'Retrieve all chat messages for the current user',
});

export const clearHistoryRoute = createRoute({
  method: 'delete',
  path: '/history',
  responses: {
    204: {
      description: 'Chat history cleared',
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
  tags: ['Chat'],
  summary: 'Clear chat history',
  description: 'Delete all chat messages for the current user',
});
