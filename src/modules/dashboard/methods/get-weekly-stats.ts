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

export async function getWeeklyStats(userId: string): Promise<WeeklyStats> {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Current week: Sunday to now
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - dayOfWeek);
  thisWeekStart.setHours(0, 0, 0, 0);

  // Last week: previous Sunday to Saturday
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  const thisWeekTotal = await getWeekTotal(userId, thisWeekStart, now);
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
