import { createRoute } from '@hono/zod-openapi';
import {
  guestLoginRequestSchema,
  guestLoginResponseSchema,
  errorResponseSchema,
} from './dto.js';

export const guestLoginRoute = createRoute({
  method: 'post',
  path: '/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: guestLoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: guestLoginResponseSchema,
        },
      },
      description: 'Guest login successful',
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
  tags: ['Authentication'],
  summary: 'Login as guest',
  description: 'Create or retrieve a guest user by localStorage guest ID',
});
