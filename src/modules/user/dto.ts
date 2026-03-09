import { z } from '@hono/zod-openapi';

export const sessionResponseSchema = z.object({
  user: z.object({
    id: z.string().openapi({ example: 'clx1234...' }),
    email: z.string().nullable().openapi({ example: 'user@example.com' }),
    firstName: z.string().nullable().openapi({ example: 'John' }),
    lastName: z.string().nullable().openapi({ example: 'Doe' }),
    image: z.string().nullable().openapi({ example: null }),
    isGuest: z.boolean().openapi({ example: false }),
    weekStartDay: z.number().min(0).max(6).openapi({ example: 0 }),
  }),
});

export const updatePreferencesSchema = z.object({
  weekStartDay: z.number().min(0).max(6).openapi({ example: 0, description: '0=Sunday, 1=Monday, ..., 6=Saturday' }),
});

export const preferencesResponseSchema = z.object({
  weekStartDay: z.number().openapi({ example: 0 }),
});

export const errorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Unauthorized' }),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
