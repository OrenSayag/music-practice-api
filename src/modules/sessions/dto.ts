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
  name: z.string().optional().openapi({ example: 'Morning scales session' }),
  notes: z.string().optional().openapi({ example: 'Great practice today' }),
});

export const endSessionResponseSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  startedAt: z.string().openapi({ example: '2026-03-10T10:00:00.000Z' }),
  durationSeconds: z.number().openapi({ example: 3600 }),
  name: z.string().nullable().openapi({ example: 'Morning scales session' }),
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

// -- Recordings --

export const recordingResponseSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  sessionId: z.string().openapi({ example: 'session-uuid' }),
  fileName: z.string().openapi({ example: 'recording-001.webm' }),
  durationSeconds: z.number().openapi({ example: 120 }),
  fileSize: z.number().openapi({ example: 245760 }),
  mimeType: z.string().openapi({ example: 'audio/webm' }),
  createdAt: z.string().openapi({ example: '2026-03-10T10:05:00.000Z' }),
});

export const recordingsListResponseSchema = z.array(recordingResponseSchema);

export const updateRecordingRequestSchema = z.object({
  fileName: z.string().min(1).openapi({ example: 'my-recording.webm' }),
});

// -- List Sessions --

export const sessionListItemSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  name: z.string().nullable().openapi({ example: 'Morning scales session' }),
  startedAt: z.string().openapi({ example: '2026-03-10T10:00:00.000Z' }),
  durationSeconds: z.number().openapi({ example: 3600 }),
  itemCount: z.number().openapi({ example: 5 }),
  recordingCount: z.number().openapi({ example: 2 }),
  tags: z.array(userTagSchema),
});

export const sessionStatsSchema = z.object({
  thisWeekSeconds: z.number().openapi({ example: 14400 }),
  totalSessions: z.number().openapi({ example: 12 }),
  avgDurationSeconds: z.number().openapi({ example: 2400 }),
  streakDays: z.number().openapi({ example: 7 }),
});

export const listSessionsResponseSchema = z.object({
  sessions: z.array(sessionListItemSchema),
  stats: sessionStatsSchema,
});

// -- Session Detail --

export const sessionDetailItemSchema = z.object({
  name: z.string().openapi({ example: 'C major scale' }),
  section: z.string().nullable().openapi({ example: 'warm up' }),
  durationSeconds: z.number().openapi({ example: 360 }),
  targetDurationSeconds: z.number().nullable().openapi({ example: 360 }),
  bpm: z.number().nullable().openapi({ example: 80 }),
  status: z.string().openapi({ example: 'done' }),
});

export const sessionDetailResponseSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  name: z.string().nullable().openapi({ example: 'Morning scales session' }),
  startedAt: z.string().openapi({ example: '2026-03-10T10:00:00.000Z' }),
  durationSeconds: z.number().openapi({ example: 3600 }),
  notes: z.string().nullable().openapi({ example: 'Great practice today' }),
  items: z.array(sessionDetailItemSchema),
  totalItems: z.number().openapi({ example: 5 }),
  completedItems: z.number().openapi({ example: 4 }),
  avgBpm: z.number().nullable().openapi({ example: 80 }),
  recordingCount: z.number().openapi({ example: 2 }),
});

// -- Types --

export type StartSessionResponse = z.infer<typeof startSessionResponseSchema>;
export type EndSessionRequest = z.infer<typeof endSessionRequestSchema>;
export type EndSessionResponse = z.infer<typeof endSessionResponseSchema>;
export type SessionItemInput = z.infer<typeof sessionItemInputSchema>;
export type SaveSessionItemsRequest = z.infer<
  typeof saveSessionItemsRequestSchema
>;
export type SessionListItem = z.infer<typeof sessionListItemSchema>;
export type SessionStats = z.infer<typeof sessionStatsSchema>;
export type ListSessionsResponse = z.infer<typeof listSessionsResponseSchema>;
export type SessionDetailResponse = z.infer<typeof sessionDetailResponseSchema>;
