import { z } from '@hono/zod-openapi';

// -- Shared --

export const errorResponseSchema = z.object({
  error: z.string(),
});

const planItemSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  sectionId: z.string().openapi({ example: 'section-uuid' }),
  name: z.string().openapi({ example: 'C major scale' }),
  targetDurationMinutes: z.number().nullable().openapi({ example: 6 }),
  bpm: z.number().nullable().openapi({ example: 80 }),
  status: z.enum(['pending', 'completed']).openapi({ example: 'pending' }),
  sortOrder: z.number().openapi({ example: 0 }),
  createdAt: z.string().openapi({ example: '2026-03-09T10:00:00.000Z' }),
});

const planSectionSchema = z.object({
  id: z.string().openapi({ example: 'section-uuid' }),
  planId: z.string().openapi({ example: 'plan-uuid' }),
  name: z.string().openapi({ example: 'warm up' }),
  sortOrder: z.number().openapi({ example: 0 }),
  createdAt: z.string().openapi({ example: '2026-03-09T10:00:00.000Z' }),
  items: z.array(planItemSchema),
});

export const planResponseSchema = z.object({
  id: z.string().openapi({ example: 'plan-uuid' }),
  userId: z.string().openapi({ example: 'user-uuid' }),
  name: z.string().openapi({ example: "today's plan" }),
  createdAt: z.string().openapi({ example: '2026-03-09T10:00:00.000Z' }),
  updatedAt: z.string().openapi({ example: '2026-03-09T10:00:00.000Z' }),
  sections: z.array(planSectionSchema),
});

// -- Create Plan --

export const createPlanRequestSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: "today's plan" }),
});

// -- Create Section --

export const createSectionRequestSchema = z.object({
  name: z.string().min(1).openapi({ example: 'warm up' }),
});

export const sectionResponseSchema = planSectionSchema;

// -- Update Section --

export const updateSectionRequestSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: 'technique' }),
  sortOrder: z.number().optional().openapi({ example: 1 }),
});

// -- Create Item --

export const createItemRequestSchema = z.object({
  name: z.string().min(1).openapi({ example: 'C major scale' }),
  targetDurationMinutes: z.number().nullable().optional().openapi({ example: 6 }),
  bpm: z.number().nullable().optional().openapi({ example: 80 }),
});

export const itemResponseSchema = planItemSchema;

// -- Update Item --

export const updateItemRequestSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: 'D minor arpeggio' }),
  targetDurationMinutes: z.number().nullable().optional().openapi({ example: 10 }),
  bpm: z.number().nullable().optional().openapi({ example: 120 }),
  status: z.enum(['pending', 'completed']).optional().openapi({ example: 'completed' }),
  sortOrder: z.number().optional().openapi({ example: 2 }),
});

// -- Reorder --

const reorderItemSchema = z.object({
  id: z.string(),
  sortOrder: z.number(),
  sectionId: z.string().optional(),
});

const reorderSectionSchema = z.object({
  id: z.string(),
  sortOrder: z.number(),
  items: z.array(reorderItemSchema).optional(),
});

export const reorderRequestSchema = z.object({
  sections: z.array(reorderSectionSchema),
});

// -- Types --

export type PlanResponse = z.infer<typeof planResponseSchema>;
export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>;
export type CreateSectionRequest = z.infer<typeof createSectionRequestSchema>;
export type UpdateSectionRequest = z.infer<typeof updateSectionRequestSchema>;
export type CreateItemRequest = z.infer<typeof createItemRequestSchema>;
export type UpdateItemRequest = z.infer<typeof updateItemRequestSchema>;
export type ReorderRequest = z.infer<typeof reorderRequestSchema>;
