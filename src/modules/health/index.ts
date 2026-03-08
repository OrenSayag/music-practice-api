import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute, z } from '@hono/zod-openapi';

const healthRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
            timestamp: z.string(),
          }),
        },
      },
      description: 'Service is healthy',
    },
  },
  tags: ['Health'],
  summary: 'Health check',
});

export const health = new OpenAPIHono();

health.openapi(healthRoute, (c) => {
  return c.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    200
  );
});
