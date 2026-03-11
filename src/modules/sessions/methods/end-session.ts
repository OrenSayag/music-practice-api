import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  practiceSessionItems,
} from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { EndSessionRequest, EndSessionResponse } from '../dto.js';

export async function endSession(
  userId: string,
  sessionId: string,
  input: EndSessionRequest
): Promise<EndSessionResponse> {
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

  // Compute duration as sum of session item durations
  const [{ total }] = await db
    .select({
      total:
        sql<number>`COALESCE(SUM(${practiceSessionItems.durationSeconds}), 0)`.as(
          'total'
        ),
    })
    .from(practiceSessionItems)
    .where(eq(practiceSessionItems.sessionId, sessionId));

  const durationSeconds = Number(total);

  const [updated] = await db
    .update(practiceSessions)
    .set({
      durationSeconds,
      notes: input.notes ?? session.notes,
    })
    .where(eq(practiceSessions.id, sessionId))
    .returning();

  return {
    id: updated.id,
    startedAt: updated.startedAt.toISOString(),
    durationSeconds: updated.durationSeconds,
    notes: updated.notes,
  };
}
