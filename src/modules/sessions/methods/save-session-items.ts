import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  practiceSessionItems,
} from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { SaveSessionItemsRequest } from '../dto.js';

export async function saveSessionItems(
  userId: string,
  sessionId: string,
  input: SaveSessionItemsRequest
): Promise<{ count: number }> {
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

  const rows = input.items.map((item, index) => ({
    sessionId,
    name: item.name,
    section: item.section ?? null,
    durationSeconds: item.durationSeconds,
    targetDurationSeconds: item.targetDurationSeconds ?? null,
    bpm: item.bpm ?? null,
    status: item.status,
    sortOrder: index,
  }));

  await db.insert(practiceSessionItems).values(rows);

  return { count: rows.length };
}
