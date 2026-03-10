import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';

interface HeatmapDay {
  date: string;
  totalSeconds: number;
}

function getWeekStart(today: Date, weekStartDay: number): Date {
  const start = new Date(today);
  const currentDay = start.getUTCDay();
  const diff = (currentDay - weekStartDay + 7) % 7;
  start.setUTCDate(start.getUTCDate() - diff);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export async function getWeeklyHeatmap(
  userId: string,
  weekStartDay: number = 0
): Promise<HeatmapDay[]> {
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);

  const rangeStart = getWeekStart(new Date(), weekStartDay);

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
        gte(practiceSessions.startedAt, rangeStart),
        lte(practiceSessions.startedAt, today)
      )
    )
    .groupBy(sql`DATE(${practiceSessions.startedAt})`);

  const dataByDate = new Map(rows.map((r) => [r.date, Number(r.totalSeconds)]));

  const days: HeatmapDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(rangeStart);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isFuture = d > today;
    const totalSeconds = isFuture ? 0 : (dataByDate.get(dateStr) || 0);
    days.push({ date: dateStr, totalSeconds });
  }

  return days;
}
