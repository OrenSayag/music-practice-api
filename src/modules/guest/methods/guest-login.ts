import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { users, sessions } from '../../../db/schema.js';
import { config } from '../../../config.js';
import { GuestLimitExceededException } from '../../../utils/exceptions.js';
import type { GuestLoginRequest, GuestLoginResponse } from '../dto.js';
import { seedGuestData } from './seed-guest-data.js';

export async function guestLogin(
  input: GuestLoginRequest,
): Promise<{ response: GuestLoginResponse; sessionToken: string }> {
  const { guestId } = input;

  let guestUser = await db.query.users.findFirst({
    where: eq(users.guestId, guestId),
  });

  if (!guestUser) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.isGuest, true));

    if (count >= config.guest.maxTotal) {
      throw new GuestLimitExceededException(
        'Maximum number of guest accounts reached',
        'GUEST_TOTAL_LIMIT',
      );
    }

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

    await seedGuestData(guestUser.id);
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
