import { db } from '../../../db/index.js';
import { chatMessages } from '../../../db/schema.js';

interface SaveMessageInput {
  userId: string;
  planId: string | null;
  role: string;
  content: string;
}

export async function saveMessage(input: SaveMessageInput) {
  const [message] = await db
    .insert(chatMessages)
    .values({
      userId: input.userId,
      planId: input.planId,
      role: input.role,
      content: input.content,
    })
    .returning();

  return message;
}
