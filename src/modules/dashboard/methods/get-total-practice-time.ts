import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practiceSessions } from '../../../db/schema.js';

export async function getTotalPracticeTime(userId: string): Promise<number> {
  const [row] = await db
    .select({
      total:
        sql<number>`COALESCE(SUM(${practiceSessions.durationSeconds}), 0)`.as(
          'total'
        ),
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId));

  return Number(row.total);
}
