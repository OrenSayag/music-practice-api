import { OpenAPIHono } from '@hono/zod-openapi';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { NotFoundException } from '../../utils/exceptions.js';
import {
  getActivePlanRoute,
  createPlanRoute,
  createSectionRoute,
  updateSectionRoute,
  deleteSectionRoute,
  createItemRoute,
  updateItemRoute,
  deleteItemRoute,
  resetItemsRoute,
  reorderPlanRoute,
} from './openapi.js';
import { getActivePlan } from './methods/get-active-plan.js';
import { createPlan } from './methods/create-plan.js';
import { createSection } from './methods/create-section.js';
import { updateSection } from './methods/update-section.js';
import { deleteSection } from './methods/delete-section.js';
import { createItem } from './methods/create-item.js';
import { updateItem } from './methods/update-item.js';
import { deleteItem } from './methods/delete-item.js';
import { resetItems } from './methods/reset-items.js';
import { reorderPlan } from './methods/reorder-plan.js';

type Variables = { auth: AuthContext };

export const plans = new OpenAPIHono<{ Variables: Variables }>();

plans.openapi(getActivePlanRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const plan = await getActivePlan(userId);
    return c.json(plan, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error fetching active plan');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

plans.openapi(createPlanRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const body = c.req.valid('json');
    const plan = await createPlan(userId, body);
    return c.json(plan, 201);
  } catch (error) {
    logger.error({ error }, 'Error creating plan');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

plans.openapi(createSectionRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { planId } = c.req.valid('param');
    const body = c.req.valid('json');
    const section = await createSection(userId, planId, body);
    return c.json(section, 201);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error creating section');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

plans.openapi(updateSectionRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sectionId } = c.req.valid('param');
    const body = c.req.valid('json');
    const section = await updateSection(userId, sectionId, body);
    return c.json(section, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error updating section');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

plans.openapi(deleteSectionRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sectionId } = c.req.valid('param');
    await deleteSection(userId, sectionId);
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error deleting section');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

plans.openapi(createItemRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { sectionId } = c.req.valid('param');
    const body = c.req.valid('json');
    const item = await createItem(userId, sectionId, body);
    return c.json(item, 201);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error creating item');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

plans.openapi(updateItemRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { itemId } = c.req.valid('param');
    const body = c.req.valid('json');
    const item = await updateItem(userId, itemId, body);
    return c.json(item, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error updating item');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

plans.openapi(deleteItemRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { itemId } = c.req.valid('param');
    await deleteItem(userId, itemId);
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error deleting item');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

plans.openapi(resetItemsRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { planId } = c.req.valid('param');
    await resetItems(userId, planId);
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error resetting plan items');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

plans.openapi(reorderPlanRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { planId } = c.req.valid('param');
    const body = c.req.valid('json');
    const plan = await reorderPlan(userId, planId, body);
    return c.json(plan, 200);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error reordering plan');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
