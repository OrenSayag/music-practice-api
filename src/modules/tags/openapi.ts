import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import {
  userTagSchema,
  userTagsResponseSchema,
  createTagRequestSchema,
  updateTagRequestSchema,
  errorResponseSchema,
} from './dto.js';

export const listTagsRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': { schema: userTagsResponseSchema },
      },
      description: 'All user tags',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Tags'],
  summary: 'List all user tags',
});

export const createTagRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': { schema: createTagRequestSchema },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': { schema: userTagSchema },
      },
      description: 'Tag created',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Tags'],
  summary: 'Create a new tag',
});

export const updateTagRoute = createRoute({
  method: 'patch',
  path: '/{tagId}',
  request: {
    params: z.object({ tagId: z.string() }),
    body: {
      content: {
        'application/json': { schema: updateTagRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: userTagSchema },
      },
      description: 'Tag updated',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Tag not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Tags'],
  summary: 'Update a tag',
});

export const deleteTagRoute = createRoute({
  method: 'delete',
  path: '/{tagId}',
  request: {
    params: z.object({ tagId: z.string() }),
  },
  responses: {
    204: { description: 'Tag deleted' },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Tag not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Tags'],
  summary: 'Delete a tag',
});
