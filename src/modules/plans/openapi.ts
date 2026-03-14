import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import {
  planResponseSchema,
  createPlanRequestSchema,
  createSectionRequestSchema,
  updateSectionRequestSchema,
  createItemRequestSchema,
  updateItemRequestSchema,
  reorderRequestSchema,
  sectionResponseSchema,
  itemResponseSchema,
  errorResponseSchema,
} from './dto.js';

export const getActivePlanRoute = createRoute({
  method: 'get',
  path: '/active',
  responses: {
    200: {
      content: { 'application/json': { schema: planResponseSchema } },
      description: 'Active plan with sections and items',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'No active plan found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Get active plan',
  description: "Returns the user's active practice plan with all sections and items",
});

export const createPlanRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': { schema: createPlanRequestSchema },
      },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: planResponseSchema } },
      description: 'Plan created',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Create new plan',
  description: 'Creates a new practice plan, deactivating any previous active plan',
});

export const createSectionRoute = createRoute({
  method: 'post',
  path: '/{planId}/sections',
  request: {
    params: z.object({ planId: z.string() }),
    body: {
      content: {
        'application/json': { schema: createSectionRequestSchema },
      },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: sectionResponseSchema } },
      description: 'Section created',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Plan not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Add section to plan',
});

export const updateSectionRoute = createRoute({
  method: 'patch',
  path: '/sections/{sectionId}',
  request: {
    params: z.object({ sectionId: z.string() }),
    body: {
      content: {
        'application/json': { schema: updateSectionRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: sectionResponseSchema } },
      description: 'Section updated',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Section not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Update section',
});

export const deleteSectionRoute = createRoute({
  method: 'delete',
  path: '/sections/{sectionId}',
  request: {
    params: z.object({ sectionId: z.string() }),
  },
  responses: {
    204: { description: 'Section deleted' },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Section not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Delete section and its items',
});

export const createItemRoute = createRoute({
  method: 'post',
  path: '/sections/{sectionId}/items',
  request: {
    params: z.object({ sectionId: z.string() }),
    body: {
      content: {
        'application/json': { schema: createItemRequestSchema },
      },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: itemResponseSchema } },
      description: 'Item created',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Section not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Add item to section',
});

export const updateItemRoute = createRoute({
  method: 'patch',
  path: '/items/{itemId}',
  request: {
    params: z.object({ itemId: z.string() }),
    body: {
      content: {
        'application/json': { schema: updateItemRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: itemResponseSchema } },
      description: 'Item updated',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Item not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Update item',
  description: 'Update item properties including name, duration, bpm, and completion status',
});

export const deleteItemRoute = createRoute({
  method: 'delete',
  path: '/items/{itemId}',
  request: {
    params: z.object({ itemId: z.string() }),
  },
  responses: {
    204: { description: 'Item deleted' },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Item not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Delete item',
});

export const resetItemsRoute = createRoute({
  method: 'post',
  path: '/{planId}/reset-items',
  request: {
    params: z.object({ planId: z.string() }),
  },
  responses: {
    204: { description: 'All items reset to pending' },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Plan not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Reset all items to pending',
  description: 'Bulk-resets all plan items to pending status',
});

export const reorderPlanRoute = createRoute({
  method: 'put',
  path: '/{planId}/reorder',
  request: {
    params: z.object({ planId: z.string() }),
    body: {
      content: {
        'application/json': { schema: reorderRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: planResponseSchema } },
      description: 'Plan reordered',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Plan not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Plans'],
  summary: 'Reorder sections and items',
  description: 'Bulk reorder sections and items within a plan (supports cross-section moves)',
});
