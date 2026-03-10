import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';
import type { StartSessionResponse } from '../dto.js';

export async function startSession(
  userId: string
): Promise<StartSessionResponse> {
  const now = new Date();

  const [session] = await db
    .insert(practiceSessions)
    .values({
      userId,
      startedAt: now,
    })
    .returning();

  return {
    id: session.id,
    startedAt: session.startedAt.toISOString(),
  };
}
