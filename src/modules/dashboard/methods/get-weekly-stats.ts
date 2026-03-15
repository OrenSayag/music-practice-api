import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';

interface WeeklyStats {
  totalSeconds: number;
  percentChange: number | null;
}

async function getWeekTotal(
  userId: string,
  start: Date,
  end: Date
): Promise<number> {
  const [row] = await db
    .select({
      total:
        sql<number>`COALESCE(SUM(${practiceSessions.durationSeconds}), 0)`.as(
          'total'
        ),
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        gte(practiceSessions.startedAt, start),
        lte(practiceSessions.startedAt, end)
      )
    );
  return Number(row.total);
}

function getWeekStart(today: Date, weekStartDay: number): Date {
  const start = new Date(today);
  const currentDay = start.getUTCDay();
  const diff = (currentDay - weekStartDay + 7) % 7;
  start.setUTCDate(start.getUTCDate() - diff);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

export async function getWeeklyStats(
  userId: string,
  weekStartDay: number = 0
): Promise<WeeklyStats> {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setUTCHours(23, 59, 59, 999);

  const thisWeekStart = getWeekStart(now, weekStartDay);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);

  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  const thisWeekTotal = await getWeekTotal(userId, thisWeekStart, endOfToday);
  const lastWeekTotal = await getWeekTotal(
    userId,
    lastWeekStart,
    lastWeekEnd
  );

  const percentChange =
    lastWeekTotal > 0
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : null;

  return {
    totalSeconds: thisWeekTotal,
    percentChange,
  };
}
