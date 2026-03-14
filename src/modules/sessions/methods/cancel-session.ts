import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';

export async function cancelSession(
  userId: string,
  sessionId: string
): Promise<void> {
  const [session] = await db
    .select({ id: practiceSessions.id })
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

  await db
    .delete(practiceSessions)
    .where(eq(practiceSessions.id, sessionId));
}
