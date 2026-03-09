import { OpenAPIHono } from '@hono/zod-openapi';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { getDashboardRoute } from './openapi.js';
import { getDailyQuote } from './methods/get-daily-quote.js';
import { getWeeklyHeatmap } from './methods/get-weekly-heatmap.js';
import { getWeeklyStats } from './methods/get-weekly-stats.js';
import { getRecentSessions } from './methods/get-recent-sessions.js';

type Variables = { auth: AuthContext };

export const dashboard = new OpenAPIHono<{ Variables: Variables }>();

dashboard.openapi(getDashboardRoute, async (c) => {
  try {
    const { userId } = c.get('auth');

    const [quote, heatmap, weeklyStats, recentSessions] = await Promise.all([
      getDailyQuote(),
      getWeeklyHeatmap(userId),
      getWeeklyStats(userId),
      getRecentSessions(userId),
    ]);

    return c.json(
      { quote, heatmap, weeklyStats, recentSessions },
      200
    );
  } catch (error) {
    logger.error({ error }, 'Error fetching dashboard data');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
