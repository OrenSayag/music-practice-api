import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  sessionTags,
  userTags,
} from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { z } from '@hono/zod-openapi';
import type { userTagSchema } from '../dto.js';

type UserTag = z.infer<typeof userTagSchema>;

async function verifySessionOwnership(
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
}

async function getLinkedTags(sessionId: string): Promise<UserTag[]> {
  const rows = await db
    .select({
      id: userTags.id,
      name: userTags.name,
      color: userTags.color,
    })
    .from(sessionTags)
    .innerJoin(userTags, eq(sessionTags.tagId, userTags.id))
    .where(eq(sessionTags.sessionId, sessionId));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color as UserTag['color'],
  }));
}

export async function getSessionTags(
  userId: string,
  sessionId: string
): Promise<UserTag[]> {
  await verifySessionOwnership(userId, sessionId);
  return getLinkedTags(sessionId);
}

export async function linkSessionTag(
  userId: string,
  sessionId: string,
  tagId: string
): Promise<UserTag[]> {
  await verifySessionOwnership(userId, sessionId);

  // Verify tag belongs to user
  const [tag] = await db
    .select()
    .from(userTags)
    .where(and(eq(userTags.id, tagId), eq(userTags.userId, userId)));

  if (!tag) {
    throw new NotFoundException('Tag not found');
  }

  // Check not already linked
  const [existing] = await db
    .select()
    .from(sessionTags)
    .where(
      and(eq(sessionTags.sessionId, sessionId), eq(sessionTags.tagId, tagId))
    );

  if (!existing) {
    await db.insert(sessionTags).values({ sessionId, tagId });
  }

  return getLinkedTags(sessionId);
}

export async function unlinkSessionTag(
  userId: string,
  sessionId: string,
  tagId: string
): Promise<UserTag[]> {
  await verifySessionOwnership(userId, sessionId);

  await db
    .delete(sessionTags)
    .where(
      and(eq(sessionTags.sessionId, sessionId), eq(sessionTags.tagId, tagId))
    );

  return getLinkedTags(sessionId);
}
