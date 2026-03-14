import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  sessionRecordings,
} from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { ToggleStarResponse } from '../dto.js';

export async function toggleStar(
  userId: string,
  recordingId: string
): Promise<ToggleStarResponse> {
  // Fetch recording + verify ownership via session
  const [recording] = await db
    .select({
      id: sessionRecordings.id,
      isStarred: sessionRecordings.isStarred,
      sessionUserId: practiceSessions.userId,
    })
    .from(sessionRecordings)
    .innerJoin(
      practiceSessions,
      eq(sessionRecordings.sessionId, practiceSessions.id)
    )
    .where(
      and(
        eq(sessionRecordings.id, recordingId),
        eq(practiceSessions.userId, userId)
      )
    );

  if (!recording) {
    throw new NotFoundException('Recording not found');
  }

  const newStarred = !recording.isStarred;

  await db
    .update(sessionRecordings)
    .set({ isStarred: newStarred })
    .where(eq(sessionRecordings.id, recordingId));

  return { id: recordingId, isStarred: newStarred };
}
