import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import {
  presetsListResponseSchema,
  presetResponseSchema,
  savePresetRequestSchema,
  errorResponseSchema,
} from './dto.js';
import { planResponseSchema } from '../plans/dto.js';

export const listPresetsRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: { 'application/json': { schema: presetsListResponseSchema } },
      description: 'List of presets with sections and items',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Presets'],
  summary: 'List presets',
  description: "Returns all user's practice presets with nested sections and items",
});

export const savePresetRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': { schema: savePresetRequestSchema },
      },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: presetResponseSchema } },
      description: 'Preset saved',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Plan not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Presets'],
  summary: 'Save plan as preset',
  description: 'Copies the structure of an existing plan into a reusable preset template',
});

export const deletePresetRoute = createRoute({
  method: 'delete',
  path: '/{presetId}',
  request: {
    params: z.object({ presetId: z.string() }),
  },
  responses: {
    204: { description: 'Preset deleted' },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Preset not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Presets'],
  summary: 'Delete preset',
});

export const loadPresetRoute = createRoute({
  method: 'post',
  path: '/{presetId}/load',
  request: {
    params: z.object({ presetId: z.string() }),
  },
  responses: {
    201: {
      content: { 'application/json': { schema: planResponseSchema } },
      description: 'New plan created from preset',
    },
    404: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Preset not found',
    },
    500: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: 'Internal server error',
    },
  },
  tags: ['Presets'],
  summary: 'Load preset as new plan',
  description: 'Creates a new active plan from a preset template, deactivating the current active plan',
});
