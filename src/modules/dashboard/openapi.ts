import { createRoute } from '@hono/zod-openapi';
import { dashboardResponseSchema, errorResponseSchema } from './dto.js';

export const getDashboardRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: { 'application/json': { schema: dashboardResponseSchema } },
      description: 'Dashboard data including quote, heatmap, stats, and recent sessions',
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
  tags: ['Dashboard'],
  summary: 'Get home dashboard data',
  description:
    'Returns aggregated dashboard data: daily quote, 7-day heatmap, weekly stats, and recent practice sessions',
});
