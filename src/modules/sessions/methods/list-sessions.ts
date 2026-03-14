import { desc, eq, sql, and, gte } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  practiceSessionItems,
  sessionRecordings,
} from '../../../db/schema.js';
import type { ListSessionsResponse } from '../dto.js';

export async function listSessions(
  userId: string
): Promise<ListSessionsResponse> {
  const rows = await db.query.practiceSessions.findMany({
    where: eq(practiceSessions.userId, userId),
    orderBy: [desc(practiceSessions.startedAt)],
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  // Batch-fetch item counts and recording counts
  const sessionIds = rows.map((r) => r.id);

  const itemCounts = sessionIds.length
    ? await db
        .select({
          sessionId: practiceSessionItems.sessionId,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(practiceSessionItems)
        .where(
          sql`${practiceSessionItems.sessionId} IN ${sessionIds}`
        )
        .groupBy(practiceSessionItems.sessionId)
    : [];

  const recordingCounts = sessionIds.length
    ? await db
        .select({
          sessionId: sessionRecordings.sessionId,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(sessionRecordings)
        .where(
          sql`${sessionRecordings.sessionId} IN ${sessionIds}`
        )
        .groupBy(sessionRecordings.sessionId)
    : [];

  const itemCountMap = new Map(
    itemCounts.map((r) => [r.sessionId, Number(r.count)])
  );
  const recordingCountMap = new Map(
    recordingCounts.map((r) => [r.sessionId, Number(r.count)])
  );

  const sessions = rows.map((session) => ({
    id: session.id,
    name: session.name,
    startedAt: session.startedAt.toISOString(),
    durationSeconds: session.durationSeconds,
    itemCount: itemCountMap.get(session.id) ?? 0,
    recordingCount: recordingCountMap.get(session.id) ?? 0,
    tags: session.tags.map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      color: t.tag.color as 'green' | 'amber' | 'cyan' | 'red',
    })),
  }));

  // Compute stats
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sunday
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekSeconds = rows
    .filter((s) => s.startedAt >= weekStart)
    .reduce((sum, s) => sum + s.durationSeconds, 0);

  const totalSessions = rows.length;

  const avgDurationSeconds =
    totalSessions > 0
      ? Math.round(
          rows.reduce((sum, s) => sum + s.durationSeconds, 0) / totalSessions
        )
      : 0;

  // Compute streak: consecutive days with sessions ending today
  const sessionDates = new Set(
    rows.map((s) => s.startedAt.toISOString().slice(0, 10))
  );
  let streakDays = 0;
  const checkDate = new Date(now);
  checkDate.setHours(0, 0, 0, 0);
  while (sessionDates.has(checkDate.toISOString().slice(0, 10))) {
    streakDays++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    sessions,
    stats: {
      thisWeekSeconds,
      totalSessions,
      avgDurationSeconds,
      streakDays,
    },
  };
}
