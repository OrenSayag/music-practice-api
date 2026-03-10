import { z } from '@hono/zod-openapi';

// -- Shared --

export const errorResponseSchema = z.object({
  error: z.string(),
});

// -- Start Session --

export const startSessionResponseSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  startedAt: z.string().openapi({ example: '2026-03-10T10:00:00.000Z' }),
});

// -- End Session --

export const endSessionRequestSchema = z.object({
  notes: z.string().optional().openapi({ example: 'Great practice today' }),
});

export const endSessionResponseSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  startedAt: z.string().openapi({ example: '2026-03-10T10:00:00.000Z' }),
  endedAt: z.string().openapi({ example: '2026-03-10T11:00:00.000Z' }),
  durationSeconds: z.number().openapi({ example: 3600 }),
  notes: z.string().nullable().openapi({ example: 'Great practice today' }),
});

// -- Save Session Items --

export const sessionItemInputSchema = z.object({
  name: z.string().min(1).openapi({ example: 'C major scale' }),
  section: z.string().optional().openapi({ example: 'warm up' }),
  durationSeconds: z.number().openapi({ example: 360 }),
  targetDurationSeconds: z.number().optional().openapi({ example: 360 }),
  bpm: z.number().optional().openapi({ example: 80 }),
  status: z
    .enum(['done', 'partial', 'none'])
    .openapi({ example: 'done' }),
});

export const saveSessionItemsRequestSchema = z.object({
  items: z.array(sessionItemInputSchema).min(1),
});

export const saveSessionItemsResponseSchema = z.object({
  count: z.number().openapi({ example: 5 }),
});

// -- Session Tag Linking --

export const tagColorSchema = z.enum(['green', 'amber', 'cyan', 'red']);

export const userTagSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  name: z.string().openapi({ example: 'scales' }),
  color: tagColorSchema.openapi({ example: 'green' }),
});

export const linkTagRequestSchema = z.object({
  tagId: z.string().openapi({ example: 'tag-uuid' }),
});

export const sessionTagsResponseSchema = z.array(userTagSchema);

// -- Types --

export type StartSessionResponse = z.infer<typeof startSessionResponseSchema>;
export type EndSessionRequest = z.infer<typeof endSessionRequestSchema>;
export type EndSessionResponse = z.infer<typeof endSessionResponseSchema>;
export type SessionItemInput = z.infer<typeof sessionItemInputSchema>;
export type SaveSessionItemsRequest = z.infer<
  typeof saveSessionItemsRequestSchema
>;
