import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';
import type { StartSessionResponse } from '../dto.js';

export async function startSession(
  userId: string
): Promise<StartSessionResponse> {
  // Deactivate any existing active sessions for this user
  await db
    .update(practiceSessions)
    .set({ status: 'inactive' })
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.status, 'active')
      )
    );

  const now = new Date();

  const [session] = await db
    .insert(practiceSessions)
    .values({
      userId,
      startedAt: now,
      status: 'active',
    })
    .returning();

  return {
    id: session.id,
    startedAt: session.startedAt.toISOString(),
  };
}
