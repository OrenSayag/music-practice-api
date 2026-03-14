import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { putObject, getObject, deleteObject } from '../../../lib/storage.js';
import { NotFoundException } from '../../../utils/exceptions.js';

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<{ image: string }> {
  const ext = file.name?.split('.').pop() ?? 'webp';
  const s3Key = `avatars/${userId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Delete old avatar if it exists with a different extension
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { image: true },
  });

  if (dbUser?.image && dbUser.image !== s3Key) {
    try {
      await deleteObject(dbUser.image);
    } catch {
      // Old file may not exist, ignore
    }
  }

  await putObject(s3Key, buffer, file.type || 'image/webp');

  await db
    .update(users)
    .set({ image: s3Key })
    .where(eq(users.id, userId));

  return { image: '/api/user/avatar/stream' };
}

export async function streamAvatar(
  userId: string,
): Promise<{ body: Uint8Array; contentType: string }> {
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { image: true },
  });

  if (!dbUser?.image) {
    throw new NotFoundException('No avatar found');
  }

  return getObject(dbUser.image);
}

export async function deleteAvatar(userId: string): Promise<void> {
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { image: true },
  });

  if (dbUser?.image) {
    try {
      await deleteObject(dbUser.image);
    } catch {
      // File may not exist, ignore
    }
  }

  await db
    .update(users)
    .set({ image: null })
    .where(eq(users.id, userId));
}
