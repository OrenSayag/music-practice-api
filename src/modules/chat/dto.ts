import { z } from '@hono/zod-openapi';

export const chatMessageSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  role: z.string().openapi({ example: 'user' }),
  content: z.string().openapi({ example: 'add sight-reading after technique' }),
  createdAt: z.string().openapi({ example: '2026-03-09T10:00:00.000Z' }),
});

// AI SDK v3 sends UIMessage format with parts array
const uiMessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
}).passthrough();

export const chatStreamRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      parts: z.array(uiMessagePartSchema).optional(),
      content: z.string().optional(),
    }).passthrough()
  ),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});
