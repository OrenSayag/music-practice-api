import { eq, and, sql, gte } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  sessionRecordings,
  practiceSessions,
  chatMessages,
} from '../db/schema.js';
import { config } from '../config.js';
import { GuestLimitExceededException } from '../utils/exceptions.js';

export async function assertGuestRecordingLimit(
  userId: string,
): Promise<void> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sessionRecordings)
    .innerJoin(
      practiceSessions,
      eq(sessionRecordings.sessionId, practiceSessions.id),
    )
    .where(eq(practiceSessions.userId, userId));

  if (result.count >= config.guest.maxRecordings) {
    throw new GuestLimitExceededException(
      `Guest users are limited to ${config.guest.maxRecordings} recordings`,
      'GUEST_RECORDING_LIMIT',
    );
  }
}

export async function assertGuestChatLimit(userId: string): Promise<void> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, userId),
        eq(chatMessages.role, 'user'),
        gte(chatMessages.createdAt, todayStart),
      ),
    );

  if (result.count >= config.guest.maxChatMessagesPerDay) {
    throw new GuestLimitExceededException(
      `Guest users are limited to ${config.guest.maxChatMessagesPerDay} chat message(s) per day`,
      'GUEST_CHAT_LIMIT',
    );
  }
}
