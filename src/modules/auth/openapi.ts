import { createRoute } from '@hono/zod-openapi';
import {
  magicLinkRequestSchema,
  messageResponseSchema,
  errorResponseSchema,
} from './dto.js';

export const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: {
        'application/json': { schema: magicLinkRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: messageResponseSchema } },
      description: 'Magic link email sent successfully',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Email not authorized',
    },
    429: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Rate limited',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Authentication'],
  summary: 'Login via magic link',
  description: 'Sends a magic link to the provided email address for passwordless authentication',
});
