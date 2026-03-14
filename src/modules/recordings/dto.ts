import { z } from '@hono/zod-openapi';
import { tagColorSchema } from '../sessions/dto.js';

// -- Query --

export const listAllRecordingsQuerySchema = z.object({
  cursor: z
    .string()
    .optional()
    .openapi({ example: '2026-03-10T10:00:00.000Z' }),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20)
    .openapi({ example: 20 }),
  starred: z
    .enum(['true', 'false'])
    .optional()
    .openapi({ example: 'true' }),
  tagId: z.string().optional().openapi({ example: 'tag-uuid' }),
});

// -- Response --

export const recordingTagSchema = z.object({
  id: z.string().openapi({ example: 'tag-uuid' }),
  name: z.string().openapi({ example: 'scales' }),
  color: tagColorSchema.openapi({ example: 'green' }),
});

export const recordingListItemSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  sessionId: z.string().openapi({ example: 'session-uuid' }),
  fileName: z.string().openapi({ example: 'recording-001.webm' }),
  durationSeconds: z.number().openapi({ example: 120 }),
  fileSize: z.number().openapi({ example: 245760 }),
  mimeType: z.string().openapi({ example: 'audio/webm' }),
  isStarred: z.boolean().openapi({ example: false }),
  createdAt: z.string().openapi({ example: '2026-03-10T10:05:00.000Z' }),
  session: z.object({
    name: z.string().nullable().openapi({ example: 'Morning scales' }),
    startedAt: z
      .string()
      .openapi({ example: '2026-03-10T10:00:00.000Z' }),
    tags: z.array(recordingTagSchema),
  }),
});

export const listAllRecordingsResponseSchema = z.object({
  recordings: z.array(recordingListItemSchema),
  nextCursor: z
    .string()
    .nullable()
    .openapi({ example: '2026-03-09T10:05:00.000Z' }),
});

export const toggleStarResponseSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  isStarred: z.boolean().openapi({ example: true }),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

// -- Types --

export type ListAllRecordingsQuery = z.infer<
  typeof listAllRecordingsQuerySchema
>;
export type RecordingListItem = z.infer<typeof recordingListItemSchema>;
export type ListAllRecordingsResponse = z.infer<
  typeof listAllRecordingsResponseSchema
>;
export type ToggleStarResponse = z.infer<typeof toggleStarResponseSchema>;
