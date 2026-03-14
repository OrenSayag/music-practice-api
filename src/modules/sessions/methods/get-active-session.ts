import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';
import type { ActiveSessionResponse } from '../dto.js';

export async function getActiveSession(
  userId: string
): Promise<ActiveSessionResponse> {
  const [session] = await db
    .select({
      id: practiceSessions.id,
      startedAt: practiceSessions.startedAt,
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.status, 'active')
      )
    )
    .limit(1);

  return {
    session: session
      ? { id: session.id, startedAt: session.startedAt.toISOString() }
      : null,
  };
}
