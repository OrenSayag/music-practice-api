import { z } from '@hono/zod-openapi';

export const quoteSchema = z.object({
  text: z.string().openapi({ example: 'Practice does not make perfect. Only perfect practice makes perfect.' }),
  author: z.string().openapi({ example: 'Vince Lombardi' }),
});

export const heatmapDaySchema = z.object({
  date: z.string().openapi({ example: '2026-03-09' }),
  totalSeconds: z.number().openapi({ example: 2400 }),
  level: z.number().min(0).max(4).openapi({ example: 2 }),
});

export const weeklyStatsSchema = z.object({
  totalSeconds: z.number().openapi({ example: 14880 }),
  percentChange: z.number().nullable().openapi({ example: 12 }),
});

export const recentSessionSchema = z.object({
  id: z.string().openapi({ example: 'uuid-here' }),
  startedAt: z.string().openapi({ example: '2026-03-09T10:00:00.000Z' }),
  durationSeconds: z.number().openapi({ example: 3600 }),
  tags: z.array(z.string()).openapi({ example: ['scales', 'etudes'] }),
});

export const dashboardResponseSchema = z.object({
  quote: quoteSchema,
  heatmap: z.array(heatmapDaySchema),
  weeklyStats: weeklyStatsSchema,
  recentSessions: z.array(recentSessionSchema),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
