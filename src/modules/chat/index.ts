import { OpenAPIHono } from '@hono/zod-openapi';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { GuestLimitExceededException } from '../../utils/exceptions.js';
import { assertGuestChatLimit } from '../../middleware/guest-limits.js';
import { getHistory } from './methods/get-history.js';
import { saveMessage } from './methods/save-messages.js';
import { clearHistory } from './methods/clear-history.js';
import { streamChat } from './methods/stream-chat.js';
import { getActivePlan } from '../plans/methods/get-active-plan.js';
import {
  streamChatRoute,
  getHistoryRoute,
  clearHistoryRoute,
} from './openapi.js';

type Variables = { auth: AuthContext };

export const chat = new OpenAPIHono<{ Variables: Variables }>();

chat.openapi(streamChatRoute, async (c) => {
  try {
    const auth = c.get('auth');
    const { userId } = auth;
    if (auth.isGuest) {
      await assertGuestChatLimit(userId);
    }
    const body = c.req.valid('json');

    // Extract text from UIMessage parts format
    const messages = body.messages.map((m) => {
      const content =
        m.content ??
        (m.parts ?? [])
          .filter((p) => p.type === 'text' && p.text)
          .map((p) => p.text!)
          .join('');
      return { role: m.role as 'user' | 'assistant', content };
    });

    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    if (!lastUserMessage?.content) {
      return c.json({ error: 'No user message provided' }, 400);
    }

    // Get plan context
    let planContext = 'No active plan.';
    let planId: string | null = null;
    try {
      const plan = await getActivePlan(userId);
      planId = plan.id;
      planContext = plan.sections
        .map(
          (s) =>
            `Section "${s.name}" [id: ${s.id}]:\n${s.items.map((i) => `  - "${i.name}" [id: ${i.id}] (${i.targetDurationMinutes ?? '?'} min, ${i.bpm ?? '?'} bpm, ${i.status})`).join('\n')}`
        )
        .join('\n');
    } catch {
      // No active plan — that's fine
    }

    // Save user message
    await saveMessage({
      userId,
      planId,
      role: 'user',
      content: lastUserMessage.content,
    });

    // Stream AI response
    const result = streamChat({ userId, planId, messages, planContext });

    // Save assistant response after stream completes (swallow errors to avoid crash)
    Promise.resolve(result.text).then(async (text) => {
      await saveMessage({
        userId,
        planId,
        role: 'assistant',
        content: text,
      });
    }).catch((error: unknown) => {
      logger.error({ error }, 'Error saving assistant response');
    });

    return result.toUIMessageStreamResponse({
      onError: (error: unknown) => {
        logger.error({ error }, 'Chat stream error');
        return 'An error occurred while processing your request.';
      },
    });
  } catch (error) {
    if (error instanceof GuestLimitExceededException) {
      return c.json({ error: error.message, code: error.code }, 403);
    }
    logger.error({ error }, 'Error in chat stream');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

chat.openapi(getHistoryRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const messages = await getHistory(userId);
    return c.json(
      messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
      200
    );
  } catch (error) {
    logger.error({ error }, 'Error fetching chat history');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

chat.openapi(clearHistoryRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    await clearHistory(userId);
    return c.body(null, 204);
  } catch (error) {
    logger.error({ error }, 'Error clearing chat history');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
