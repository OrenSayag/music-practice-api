import { desc, eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';

interface RecentSession {
  id: string;
  name: string | null;
  startedAt: string;
  durationSeconds: number;
  tags: string[];
}

export async function getRecentSessions(
  userId: string,
  limit: number = 4
): Promise<RecentSession[]> {
  const rows = await db.query.practiceSessions.findMany({
    where: eq(practiceSessions.userId, userId),
    orderBy: [desc(practiceSessions.startedAt)],
    limit,
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  return rows.map((session) => ({
    id: session.id,
    name: session.name,
    startedAt: session.startedAt.toISOString(),
    durationSeconds: session.durationSeconds,
    tags: session.tags.map((t) => t.tag.name),
  }));
}
