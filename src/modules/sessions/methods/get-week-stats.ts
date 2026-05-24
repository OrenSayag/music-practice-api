import { and, eq, gte, sum } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';

export interface WeekStats {
  totalSeconds: number;
  weekStartIso: string;
}

export async function getWeekStats(userId: string, now: Date = new Date()): Promise<WeekStats> {
  const weekStart = startOfIsoWeekUtc(now);
  const rows = await db
    .select({ total: sum(practiceSessions.durationSeconds) })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.status, 'inactive'),
        gte(practiceSessions.startedAt, weekStart),
      ),
    );
  const totalSeconds = Number(rows[0]?.total ?? 0);
  return { totalSeconds, weekStartIso: weekStart.toISOString() };
}

function startOfIsoWeekUtc(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayOfWeek = d.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d;
}
