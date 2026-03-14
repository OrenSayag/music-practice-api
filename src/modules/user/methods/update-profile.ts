import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import type { UpdateProfileInput, SessionResponse } from '../dto.js';

type MetronomeSound = SessionResponse['user']['metronomeSound'];

export async function updateProfile(
  userId: string,
  email: string | null,
  input: UpdateProfileInput,
): Promise<SessionResponse> {
  const updateData: Record<string, unknown> = {};
  if (input.firstName !== undefined) updateData.firstName = input.firstName;
  if (input.lastName !== undefined) updateData.lastName = input.lastName;

  if (Object.keys(updateData).length > 0) {
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return {
    user: {
      id: userId,
      email: email || null,
      firstName: dbUser?.firstName || null,
      lastName: dbUser?.lastName || null,
      image: dbUser?.image ? '/api/user/avatar/stream' : null,
      isGuest: dbUser?.isGuest || false,
      weekStartDay: dbUser?.weekStartDay ?? 0,
      metronomeSound: (dbUser?.metronomeSound ?? 'wood') as MetronomeSound,
    },
  };
}
