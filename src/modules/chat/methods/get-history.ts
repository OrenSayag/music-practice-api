import { eq, and, asc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { chatMessages } from '../../../db/schema.js';

export async function getHistory(userId: string) {
  return db.query.chatMessages.findMany({
    where: and(
      eq(chatMessages.userId, userId),
    ),
    orderBy: [asc(chatMessages.createdAt)],
  });
}
