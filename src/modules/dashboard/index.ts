import { OpenAPIHono } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { getDashboardRoute } from './openapi.js';
import { getDailyQuote } from './methods/get-daily-quote.js';
import { getWeeklyHeatmap } from './methods/get-weekly-heatmap.js';
import { getWeeklyStats } from './methods/get-weekly-stats.js';
import { getRecentSessions } from './methods/get-recent-sessions.js';
import { getTotalPracticeTime } from './methods/get-total-practice-time.js';

type Variables = { auth: AuthContext };

export const dashboard = new OpenAPIHono<{ Variables: Variables }>();

dashboard.openapi(getDashboardRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { locale } = c.req.valid('query');

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { weekStartDay: true },
    });
    const weekStartDay = dbUser?.weekStartDay ?? 0;

    const [quote, heatmap, weeklyStats, recentSessions, totalPracticeSeconds] =
      await Promise.all([
        getDailyQuote(locale),
        getWeeklyHeatmap(userId, weekStartDay),

        getWeeklyStats(userId, weekStartDay),
        getRecentSessions(userId),
        getTotalPracticeTime(userId),
      ]);

    return c.json(
      { quote, heatmap, weeklyStats, recentSessions, totalPracticeSeconds },
      200
    );
  } catch (error) {
    logger.error({ error }, 'Error fetching dashboard data');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
