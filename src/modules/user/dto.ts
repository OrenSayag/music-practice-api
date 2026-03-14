import { z } from '@hono/zod-openapi';

export const metronomeSoundSchema = z.enum(['wood', 'glass', 'electromagnetic', 'arcane']);

export const sessionResponseSchema = z.object({
  user: z.object({
    id: z.string().openapi({ example: 'clx1234...' }),
    email: z.string().nullable().openapi({ example: 'user@example.com' }),
    firstName: z.string().nullable().openapi({ example: 'John' }),
    lastName: z.string().nullable().openapi({ example: 'Doe' }),
    image: z.string().nullable().openapi({ example: null }),
    isGuest: z.boolean().openapi({ example: false }),
    weekStartDay: z.number().min(0).max(6).openapi({ example: 0 }),
    metronomeSound: metronomeSoundSchema.openapi({ example: 'wood' }),
  }),
});

export const updatePreferencesSchema = z.object({
  weekStartDay: z.number().min(0).max(6).optional().openapi({ example: 0, description: '0=Sunday, 1=Monday, ..., 6=Saturday' }),
  metronomeSound: metronomeSoundSchema.optional().openapi({ example: 'wood' }),
});

export const preferencesResponseSchema = z.object({
  weekStartDay: z.number().openapi({ example: 0 }),
  metronomeSound: metronomeSoundSchema.openapi({ example: 'wood' }),
});

export const errorResponseSchema = z.object({
  error: z.string().openapi({ example: 'Unauthorized' }),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional().openapi({ example: 'John' }),
  lastName: z.string().min(1).max(50).optional().openapi({ example: 'Doe' }),
});

export const uploadAvatarResponseSchema = z.object({
  image: z.string().openapi({ example: '/api/user/avatar/stream' }),
});

export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// -- Practice State --

const customTimerSchema = z.object({
  id: z.string(),
  label: z.string(),
  totalSeconds: z.number(),
  remainingSeconds: z.number(),
  announceEnabled: z.boolean(),
  announceText: z.string(),
});

const defaultTimerSettingsSchema = z.object({
  announceNextItem: z.boolean(),
  autoStartNextItem: z.boolean(),
});

const metronomeStateSchema = z.object({
  bpm: z.number(),
  beats: z.number(),
  accents: z.array(z.boolean()),
});

export const practiceStateSchema = z.object({
  customTimers: z.array(customTimerSchema),
  defaultTimerSettings: defaultTimerSettingsSchema,
  selectedTimerId: z.string().nullable(),
  metronome: metronomeStateSchema,
});

export const practiceStateResponseSchema = z.object({
  practiceState: practiceStateSchema.nullable(),
});

export type PracticeState = z.infer<typeof practiceStateSchema>;
export type PracticeStateResponse = z.infer<typeof practiceStateResponseSchema>;
