import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { userTags } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { UserTag, CreateTagRequest, UpdateTagRequest } from '../dto.js';

function toResponse(row: typeof userTags.$inferSelect): UserTag {
  return {
    id: row.id,
    name: row.name,
    color: row.color as UserTag['color'],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listTags(userId: string): Promise<UserTag[]> {
  const rows = await db
    .select()
    .from(userTags)
    .where(eq(userTags.userId, userId));

  return rows.map(toResponse);
}

export async function createTag(
  userId: string,
  input: CreateTagRequest
): Promise<UserTag> {
  const [tag] = await db
    .insert(userTags)
    .values({
      userId,
      name: input.name,
      color: input.color,
    })
    .returning();

  return toResponse(tag);
}

export async function updateTag(
  userId: string,
  tagId: string,
  input: UpdateTagRequest
): Promise<UserTag> {
  const [existing] = await db
    .select()
    .from(userTags)
    .where(and(eq(userTags.id, tagId), eq(userTags.userId, userId)));

  if (!existing) {
    throw new NotFoundException('Tag not found');
  }

  const [updated] = await db
    .update(userTags)
    .set({
      name: input.name ?? existing.name,
      color: input.color ?? existing.color,
    })
    .where(eq(userTags.id, tagId))
    .returning();

  return toResponse(updated);
}

export async function deleteTag(
  userId: string,
  tagId: string
): Promise<void> {
  const [existing] = await db
    .select()
    .from(userTags)
    .where(and(eq(userTags.id, tagId), eq(userTags.userId, userId)));

  if (!existing) {
    throw new NotFoundException('Tag not found');
  }

  await db.delete(userTags).where(eq(userTags.id, tagId));
}
