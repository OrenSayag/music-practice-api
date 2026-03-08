import { createRoute } from '@hono/zod-openapi';
import {
  sessionResponseSchema,
  errorResponseSchema,
} from './dto.js';

export const getMeRoute = createRoute({
  method: 'get',
  path: '/me',
  responses: {
    200: {
      content: { 'application/json': { schema: sessionResponseSchema } },
      description: 'Current authenticated user',
    },
    401: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Not authenticated',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['User'],
  summary: 'Get current authenticated user',
  description: 'Returns the currently authenticated user session',
});
