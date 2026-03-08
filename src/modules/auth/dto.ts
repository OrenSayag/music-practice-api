import { z } from '@hono/zod-openapi';

export const magicLinkRequestSchema = z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
});

export const messageResponseSchema = z.object({
  message: z.string().openapi({ example: 'Magic link sent' }),
});

export const errorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Unauthorized' }),
});

export type MagicLinkRequest = z.infer<typeof magicLinkRequestSchema>;
