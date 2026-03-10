import { OpenAPIHono } from '@hono/zod-openapi';
import type { AuthContext } from '../../middleware/require-auth.js';
import { logger } from '../../utils/logger.js';
import { NotFoundException } from '../../utils/exceptions.js';
import {
  listPresetsRoute,
  savePresetRoute,
  deletePresetRoute,
  loadPresetRoute,
} from './openapi.js';
import { listPresets } from './methods/list-presets.js';
import { savePreset } from './methods/save-preset.js';
import { deletePreset } from './methods/delete-preset.js';
import { loadPreset } from './methods/load-preset.js';

type Variables = { auth: AuthContext };

export const presets = new OpenAPIHono<{ Variables: Variables }>();

presets.openapi(listPresetsRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const result = await listPresets(userId);
    return c.json(result, 200);
  } catch (error) {
    logger.error({ error }, 'Error listing presets');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

presets.openapi(savePresetRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const body = c.req.valid('json');
    const preset = await savePreset(userId, body);
    return c.json(preset, 201);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error saving preset');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

presets.openapi(deletePresetRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { presetId } = c.req.valid('param');
    await deletePreset(userId, presetId);
    return c.body(null, 204);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error deleting preset');
    return c.json({ error: 'Internal server error' }, 500);
  }
});

presets.openapi(loadPresetRoute, async (c) => {
  try {
    const { userId } = c.get('auth');
    const { presetId } = c.req.valid('param');
    const plan = await loadPreset(userId, presetId);
    return c.json(plan, 201);
  } catch (error) {
    if (error instanceof NotFoundException) {
      return c.json({ error: error.message }, 404);
    }
    logger.error({ error }, 'Error loading preset');
    return c.json({ error: 'Internal server error' }, 500);
  }
});
