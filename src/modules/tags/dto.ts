import { z } from '@hono/zod-openapi';

export const errorResponseSchema = z.object({
  error: z.string(),
});

export const tagColorSchema = z.enum(['green', 'amber', 'cyan', 'red']);

export const userTagSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  name: z.string().openapi({ example: 'scales' }),
  color: tagColorSchema.openapi({ example: 'green' }),
  createdAt: z.string().openapi({ example: '2026-03-10T10:00:00.000Z' }),
});

export const createTagRequestSchema = z.object({
  name: z.string().min(1).openapi({ example: 'scales' }),
  color: tagColorSchema.openapi({ example: 'green' }),
});

export const updateTagRequestSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: 'technique' }),
  color: tagColorSchema.optional().openapi({ example: 'amber' }),
});

export const userTagsResponseSchema = z.array(userTagSchema);

// -- Types --

export type UserTag = z.infer<typeof userTagSchema>;
export type CreateTagRequest = z.infer<typeof createTagRequestSchema>;
export type UpdateTagRequest = z.infer<typeof updateTagRequestSchema>;
export type TagColor = z.infer<typeof tagColorSchema>;
