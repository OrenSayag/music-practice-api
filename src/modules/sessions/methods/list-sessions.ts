import { desc, eq, sql, and, lt } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  practiceSessionItems,
  sessionRecordings,
} from '../../../db/schema.js';
import type { ListSessionsResponse } from '../dto.js';

interface ListSessionsParams {
  userId: string;
  cursor?: string;
  limit: number;
}

export async function listSessions({
  userId,
  cursor,
  limit,
}: ListSessionsParams): Promise<ListSessionsResponse> {
  const conditions = [
    eq(practiceSessions.userId, userId),
    eq(practiceSessions.status, 'inactive'),
  ];
  if (cursor) {
    conditions.push(lt(practiceSessions.startedAt, new Date(cursor)));
  }

  const rows = await db.query.practiceSessions.findMany({
    where: and(...conditions),
    orderBy: [desc(practiceSessions.startedAt)],
    limit: limit + 1,
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  // Batch-fetch item counts and recording counts for this page
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

  const nextCursor = hasMore
    ? rows[rows.length - 1].startedAt.toISOString()
    : null;

  // Stats: aggregate over ALL user sessions (not just this page)
  const stats = await computeStats(userId);

  return { sessions, stats, nextCursor };
}

async function computeStats(userId: string) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const [aggregateResult] = await db
    .select({
      totalSessions: sql<number>`count(*)`,
      totalSeconds: sql<number>`coalesce(sum(${practiceSessions.durationSeconds}), 0)`,
      thisWeekSeconds: sql<number>`coalesce(sum(case when ${practiceSessions.startedAt} >= ${weekStart.toISOString()} then ${practiceSessions.durationSeconds} else 0 end), 0)`,
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.status, 'inactive')
      )
    );

  const totalSessions = Number(aggregateResult.totalSessions);
  const totalSeconds = Number(aggregateResult.totalSeconds);
  const thisWeekSeconds = Number(aggregateResult.thisWeekSeconds);
  const avgDurationSeconds =
    totalSessions > 0 ? Math.round(totalSeconds / totalSessions) : 0;

  // Streak: fetch distinct session dates DESC, iterate until gap
  const dateRows = await db
    .selectDistinct({
      date: sql<string>`date(${practiceSessions.startedAt})`.as('date'),
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.status, 'inactive')
      )
    )
    .orderBy(sql`date(${practiceSessions.startedAt}) desc`);

  const sessionDates = new Set(dateRows.map((r) => r.date));
  let streakDays = 0;
  const checkDate = new Date(now);
  checkDate.setHours(0, 0, 0, 0);
  while (sessionDates.has(checkDate.toISOString().slice(0, 10))) {
    streakDays++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return { thisWeekSeconds, totalSessions, avgDurationSeconds, streakDays };
}
