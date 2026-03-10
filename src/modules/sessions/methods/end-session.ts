import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';
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

  // If already ended, only update notes
  const alreadyEnded = session.endedAt !== null;

  const now = new Date();
  const durationSeconds = alreadyEnded
    ? session.durationSeconds
    : Math.round((now.getTime() - session.startedAt.getTime()) / 1000);

  const [updated] = await db
    .update(practiceSessions)
    .set({
      endedAt: alreadyEnded ? session.endedAt : now,
      durationSeconds,
      notes: input.notes ?? session.notes,
    })
    .where(eq(practiceSessions.id, sessionId))
    .returning();

  return {
    id: updated.id,
    startedAt: updated.startedAt.toISOString(),
    endedAt: updated.endedAt!.toISOString(),
    durationSeconds: updated.durationSeconds,
    notes: updated.notes,
  };
}
