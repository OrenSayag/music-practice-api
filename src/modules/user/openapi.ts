import { createRoute } from '@hono/zod-openapi';
import {
  sessionResponseSchema,
  errorResponseSchema,
  updatePreferencesSchema,
  preferencesResponseSchema,
  practiceStateResponseSchema,
  practiceStateSchema,
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

export const getPracticeStateRoute = createRoute({
  method: 'get',
  path: '/practice-state',
  responses: {
    200: {
      content: { 'application/json': { schema: practiceStateResponseSchema } },
      description: 'Current practice state',
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
  summary: 'Get practice state',
  description: 'Returns the persisted practice state for the current user',
});

export const putPracticeStateRoute = createRoute({
  method: 'put',
  path: '/practice-state',
  request: {
    body: {
      content: {
        'application/json': {
          schema: practiceStateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: practiceStateResponseSchema } },
      description: 'Practice state saved',
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
  summary: 'Save practice state',
  description: 'Saves the current practice state for cross-device persistence',
});
