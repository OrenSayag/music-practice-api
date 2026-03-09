import { createRoute } from '@hono/zod-openapi';
import {
  sessionResponseSchema,
  errorResponseSchema,
  updatePreferencesSchema,
  preferencesResponseSchema,
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

export const updatePreferencesRoute = createRoute({
  method: 'patch',
  path: '/preferences',
  request: {
    body: {
      content: {
        'application/json': {
          schema: updatePreferencesSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: preferencesResponseSchema } },
      description: 'Preferences updated',
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
  summary: 'Update user preferences',
  description: 'Updates user preferences like week start day',
});
