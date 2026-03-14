import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  sessionRecordings,
} from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import { deleteObject } from '../../../lib/storage.js';
import { logger } from '../../../utils/logger.js';

export async function deleteSession(
  userId: string,
  sessionId: string
): Promise<void> {
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

  // Delete S3 recordings
  const recordings = await db
    .select({ s3Key: sessionRecordings.s3Key })
    .from(sessionRecordings)
    .where(eq(sessionRecordings.sessionId, sessionId));

  for (const recording of recordings) {
    try {
      await deleteObject(recording.s3Key);
    } catch (error) {
      logger.warn({ error, s3Key: recording.s3Key }, 'Failed to delete S3 object');
    }
  }

  // Cascade delete handles items, tags, recordings in DB
  await db
    .delete(practiceSessions)
    .where(eq(practiceSessions.id, sessionId));
}
