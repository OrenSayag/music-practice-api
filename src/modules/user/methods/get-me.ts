import type { AuthUser } from '@hono/auth-js';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { users } from '../../../db/schema.js';
import { UnauthenticatedException } from '../../../utils/exceptions.js';
import type { SessionResponse } from '../dto.js';

export async function getMe(authUser: AuthUser | null): Promise<SessionResponse> {
  if (!authUser?.session?.user) {
    throw new UnauthenticatedException();
  }

  const { user } = authUser.session;
  const userId = user.id || '';

  const dbUser = userId
    ? await db.query.users.findFirst({ where: eq(users.id, userId) })
    : null;

  return {
    user: {
      id: userId,
      email: user.email || '',
      firstName: dbUser?.firstName || null,
      lastName: dbUser?.lastName || null,
      image: user.image || null,
    },
  };
}
