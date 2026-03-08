import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { users, sessions } from '../../../db/schema.js';
import { config } from '../../../config.js';
import type { GuestLoginRequest, GuestLoginResponse } from '../dto.js';

export async function guestLogin(
  input: GuestLoginRequest,
): Promise<{ response: GuestLoginResponse; sessionToken: string }> {
  const { guestId } = input;

  let guestUser = await db.query.users.findFirst({
    where: eq(users.guestId, guestId),
  });

  if (!guestUser) {
    const [created] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        firstName: 'Guest',
        isGuest: true,
        guestId,
      })
      .returning();
    guestUser = created;
  }

  const sessionToken = crypto.randomUUID();
  const expires = new Date(
    Date.now() + config.auth.sessionMaxAgeSeconds * 1000,
  );

  await db.insert(sessions).values({
    sessionToken,
    userId: guestUser.id,
    expires,
  });

  return {
    response: {
      user: {
        id: guestUser.id,
        isGuest: true,
      },
    },
    sessionToken,
  };
}
