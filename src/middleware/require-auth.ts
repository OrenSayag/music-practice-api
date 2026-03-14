import { createMiddleware } from 'hono/factory';
import { getAuthUser } from '@hono/auth-js';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, auditLogs } from '../db/schema.js';

export interface AuthContext {
  userId: string;
  email: string | null;
  isGuest: boolean;
}

export function requireAuth() {
  return createMiddleware(async (c, next) => {
    const authUser = await getAuthUser(c);
    const userId = authUser?.session?.user?.id;
    const email = authUser?.session?.user?.email;

    if (!userId) {
      return c.json({ error: 'Unauthenticated' }, 401);
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!dbUser) {
      return c.json({ error: 'Unauthenticated' }, 401);
    }

    c.set('auth', {
      userId,
      email: email || null,
      isGuest: dbUser.isGuest,
    });

    db.insert(auditLogs)
      .values({
        userId,
        method: c.req.method,
        path: c.req.path,
      })
      .catch(() => {});

    await next();
  });
}
