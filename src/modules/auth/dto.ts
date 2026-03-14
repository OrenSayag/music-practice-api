import { z } from '@hono/zod-openapi';

export const errorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Unauthorized' }),
});
