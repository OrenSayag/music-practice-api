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

export const guestLimitErrorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Guest users are limited to 3 recordings' }),
  code: z.string().openapi({ example: 'GUEST_RECORDING_LIMIT' }),
});

export const guestLimitsResponseSchema = z.object({
  maxRecordings: z.number().openapi({ example: 3 }),
  maxChatMessagesPerDay: z.number().openapi({ example: 1 }),
});

export type GuestLoginRequest = z.infer<typeof guestLoginRequestSchema>;
export type GuestLoginResponse = z.infer<typeof guestLoginResponseSchema>;
export type GuestLimitsResponse = z.infer<typeof guestLimitsResponseSchema>;
