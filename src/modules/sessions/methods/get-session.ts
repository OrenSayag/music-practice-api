import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  practiceSessionItems,
  sessionRecordings,
} from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { SessionDetailResponse } from '../dto.js';

export async function getSession(
  userId: string,
  sessionId: string
): Promise<SessionDetailResponse> {
  const [session] = await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.id, sessionId),
        eq(practiceSessions.userId, userId)
      )
    );

  if (!session) {
    throw new NotFoundException('Session not found');
  }

  const items = await db
    .select()
    .from(practiceSessionItems)
    .where(eq(practiceSessionItems.sessionId, sessionId));

  const [recordingCountResult] = await db
    .select({ count: sql<number>`count(*)`.as('count') })
    .from(sessionRecordings)
    .where(eq(sessionRecordings.sessionId, sessionId));

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.status === 'done').length;

  const bpmItems = items.filter((i) => i.bpm !== null && i.bpm > 0);
  const avgBpm =
    bpmItems.length > 0
      ? Math.round(
          bpmItems.reduce((sum, i) => sum + (i.bpm ?? 0), 0) / bpmItems.length
        )
      : null;

  return {
    id: session.id,
    name: session.name,
    startedAt: session.startedAt.toISOString(),
    durationSeconds: session.durationSeconds,
    notes: session.notes,
    items: items.map((item) => ({
      name: item.name,
      section: item.section,
      durationSeconds: item.durationSeconds,
      targetDurationSeconds: item.targetDurationSeconds,
      bpm: item.bpm,
      status: item.status,
    })),
    totalItems,
    completedItems,
    avgBpm,
    recordingCount: Number(recordingCountResult.count),
  };
}
