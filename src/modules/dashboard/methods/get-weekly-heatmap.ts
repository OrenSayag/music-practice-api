import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';

interface HeatmapDay {
  date: string;
  totalSeconds: number;
  level: number;
}

function calculateLevel(totalSeconds: number): number {
  if (totalSeconds === 0) return 0;
  if (totalSeconds < 900) return 1; // < 15 min
  if (totalSeconds < 1800) return 2; // < 30 min
  if (totalSeconds < 3600) return 3; // < 60 min
  return 4; // 60+ min
}

export async function getWeeklyHeatmap(
  userId: string
): Promise<HeatmapDay[]> {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      date: sql<string>`DATE(${practiceSessions.startedAt})`.as('date'),
      totalSeconds:
        sql<number>`COALESCE(SUM(${practiceSessions.durationSeconds}), 0)`.as(
          'total_seconds'
        ),
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        gte(practiceSessions.startedAt, weekAgo),
        lte(practiceSessions.startedAt, today)
      )
    )
    .groupBy(sql`DATE(${practiceSessions.startedAt})`);

  const dataByDate = new Map(rows.map((r) => [r.date, Number(r.totalSeconds)]));

  const days: HeatmapDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const totalSeconds = dataByDate.get(dateStr) || 0;
    days.push({
      date: dateStr,
      totalSeconds,
      level: calculateLevel(totalSeconds),
    });
  }

  return days;
}
