import { z } from '@hono/zod-openapi';

export const guestLoginRequestSchema = z.object({
  guestId: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
});

export const guestLoginResponseSchema = z.object({
  user: z.object({
    id: z.string().openapi({ example: 'clx1234...' }),
    isGuest: z.boolean().openapi({ example: true }),
  }),
});

export const errorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Invalid guest ID' }),
});

export type GuestLoginRequest = z.infer<typeof guestLoginRequestSchema>;
export type GuestLoginResponse = z.infer<typeof guestLoginResponseSchema>;
