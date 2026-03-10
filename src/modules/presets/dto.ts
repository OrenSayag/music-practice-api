import { z } from '@hono/zod-openapi';

// -- Shared --

export const errorResponseSchema = z.object({
  error: z.string(),
});

const presetItemSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  sectionId: z.string().openapi({ example: 'section-uuid' }),
  name: z.string().openapi({ example: 'C major scale' }),
  targetDurationMinutes: z.number().nullable().openapi({ example: 6 }),
  bpm: z.number().nullable().openapi({ example: 80 }),
  sortOrder: z.number().openapi({ example: 0 }),
});

const presetSectionSchema = z.object({
  id: z.string().openapi({ example: 'section-uuid' }),
  presetId: z.string().openapi({ example: 'preset-uuid' }),
  name: z.string().openapi({ example: 'warm up' }),
  sortOrder: z.number().openapi({ example: 0 }),
  items: z.array(presetItemSchema),
});

export const presetResponseSchema = z.object({
  id: z.string().openapi({ example: 'preset-uuid' }),
  userId: z.string().openapi({ example: 'user-uuid' }),
  name: z.string().openapi({ example: 'my practice template' }),
  createdAt: z.string().openapi({ example: '2026-03-09T10:00:00.000Z' }),
  sections: z.array(presetSectionSchema),
});

export const presetsListResponseSchema = z.array(presetResponseSchema);

// -- Save Preset --

export const savePresetRequestSchema = z.object({
  planId: z.string().openapi({ example: 'plan-uuid' }),
  name: z.string().min(1).optional().openapi({ example: 'my practice template' }),
});

// -- Types --

export type PresetResponse = z.infer<typeof presetResponseSchema>;
export type SavePresetRequest = z.infer<typeof savePresetRequestSchema>;
