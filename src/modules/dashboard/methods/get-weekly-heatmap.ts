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
  if (totalSeconds < 900) return 1;
  if (totalSeconds < 1800) return 2;
  if (totalSeconds < 3600) return 3;
  return 4;
}

function getWeekStart(today: Date, weekStartDay: number): Date {
  const start = new Date(today);
  const currentDay = start.getDay();
  const diff = (currentDay - weekStartDay + 7) % 7;
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function getWeeklyHeatmap(
  userId: string,
  weekStartDay: number = 0,
  weeks: number = 7
): Promise<HeatmapDay[]> {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const currentWeekStart = getWeekStart(new Date(), weekStartDay);
  const rangeStart = new Date(currentWeekStart);
  rangeStart.setDate(rangeStart.getDate() - (weeks - 1) * 7);

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

  // Always return exactly weeks*7 days so every day-of-week row has equal columns
  const totalDays = weeks * 7;
  const days: HeatmapDay[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isFuture = d > today;
    const totalSeconds = isFuture ? 0 : (dataByDate.get(dateStr) || 0);
    days.push({
      date: dateStr,
      totalSeconds,
      level: isFuture ? 0 : calculateLevel(totalSeconds),
    });
  }

  return days;
}
