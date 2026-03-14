import { createRoute } from '@hono/zod-openapi';
import {
  guestLoginRequestSchema,
  guestLoginResponseSchema,
  guestLimitsResponseSchema,
  errorResponseSchema,
  guestLimitErrorResponseSchema,
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
    403: {
      content: {
        'application/json': {
          schema: guestLimitErrorResponseSchema,
        },
      },
      description: 'Guest limit exceeded',
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

export const guestLimitsRoute = createRoute({
  method: 'get',
  path: '/limits',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: guestLimitsResponseSchema,
        },
      },
      description: 'Guest usage limits',
    },
  },
  tags: ['Authentication'],
  summary: 'Get guest limits',
  description: 'Returns the configured guest usage limits',
});
