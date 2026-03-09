import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { chatMessages } from '../../../db/schema.js';

export async function clearHistory(userId: string) {
  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
}
