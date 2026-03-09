import { readFileSync } from 'node:fs';
import { streamText, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { config } from '../../../config.js';
import { createSection } from '../../plans/methods/create-section.js';
import { createItem } from '../../plans/methods/create-item.js';
import { updateSection } from '../../plans/methods/update-section.js';
import { updateItem } from '../../plans/methods/update-item.js';
import { deleteSection } from '../../plans/methods/delete-section.js';
import { deleteItem } from '../../plans/methods/delete-item.js';
import { reorderPlan } from '../../plans/methods/reorder-plan.js';
import { getActivePlan } from '../../plans/methods/get-active-plan.js';
import { logger } from '../../../utils/logger.js';

interface StreamChatInput {
  userId: string;
  planId: string | null;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  planContext: string;
}

const systemPromptTemplate = readFileSync(
  config.ai.systemPromptFilePath,
  'utf-8'
);

function getModel() {
  const { provider, apiKey, model } = config.ai;

  if (provider === 'anthropic') {
    const anthropic = createAnthropic({ apiKey });
    return anthropic(model);
  }

  const openai = createOpenAI({ apiKey });
  return openai(model);
}

interface PlanOperation {
  type: string;
  sectionId?: string;
  sectionName?: string;
  itemId?: string;
  name?: string;
  targetDurationMinutes?: number | null;
  bpm?: number | null;
  status?: 'pending' | 'completed';
  itemIds?: string[];
}

async function executePlanOperations(
  userId: string,
  planId: string,
  operations: PlanOperation[]
) {
  const results: Array<{ op: string; success: boolean; error?: string; id?: string }> = [];

  for (const op of operations) {
    try {
      switch (op.type) {
        case 'addSection': {
          const section = await createSection(userId, planId, { name: op.name! });
          results.push({ op: 'addSection', success: true, id: section.id });
          break;
        }
        case 'addItem': {
          const item = await createItem(userId, op.sectionId!, {
            name: op.name!,
            targetDurationMinutes: op.targetDurationMinutes,
            bpm: op.bpm,
          });
          results.push({ op: 'addItem', success: true, id: item.id });
          break;
        }
        case 'updateItem': {
          await updateItem(userId, op.itemId!, {
            name: op.name,
            targetDurationMinutes: op.targetDurationMinutes,
            bpm: op.bpm,
            status: op.status,
          });
          results.push({ op: 'updateItem', success: true, id: op.itemId });
          break;
        }
        case 'updateSection': {
          await updateSection(userId, op.sectionId!, { name: op.name });
          results.push({ op: 'updateSection', success: true, id: op.sectionId });
          break;
        }
        case 'deleteItem': {
          await deleteItem(userId, op.itemId!);
          results.push({ op: 'deleteItem', success: true, id: op.itemId });
          break;
        }
        case 'deleteSection': {
          await deleteSection(userId, op.sectionId!);
          results.push({ op: 'deleteSection', success: true, id: op.sectionId });
          break;
        }
        case 'reorderItems': {
          await reorderPlan(userId, planId, {
            sections: [{
              id: op.sectionId!,
              sortOrder: 0,
              items: op.itemIds!.map((id, i) => ({ id, sortOrder: i })),
            }],
          });
          results.push({ op: 'reorderItems', success: true });
          break;
        }
        default:
          results.push({ op: op.type, success: false, error: `Unknown operation: ${op.type}` });
      }
    } catch (error) {
      logger.error({ error, op }, 'Tool: updatePlan operation failed');
      results.push({ op: op.type, success: false, error: 'Operation failed' });
    }
  }

  try {
    const plan = await getActivePlan(userId);
    return { results, plan: formatPlanSummary(plan) };
  } catch {
    return { results };
  }
}

function formatPlanSummary(plan: Awaited<ReturnType<typeof getActivePlan>>) {
  return plan.sections.map((s) => ({
    id: s.id,
    name: s.name,
    items: s.items.map((i) => ({ id: i.id, name: i.name, sortOrder: i.sortOrder })),
  }));
}

export function streamChat(input: StreamChatInput) {
  const { userId, planId, messages, planContext } = input;
  const systemPrompt = systemPromptTemplate.replace('{planContext}', planContext);

  return streamText({
    model: getModel(),
    system: systemPrompt,
    messages,
    stopWhen: stepCountIs(10),
    onError: (event) => {
      logger.error({ error: event.error }, 'Chat stream error');
    },
    onStepFinish: (event) => {
      const toolCalls = event.toolCalls ?? [];
      const toolResults = event.toolResults ?? [];
      if (toolCalls.length > 0) {
        logger.info(
          {
            tools: toolCalls.map((tc) => ({ name: tc.toolName, input: tc.input })),
            results: toolResults.map((tr) => ({ name: tr.toolName, result: 'result' in tr ? tr.result : undefined })),
          },
          'Chat step finished with tool calls'
        );
      }
    },
    onFinish: (event) => {
      const allToolCalls = event.steps.flatMap((s) => s.toolCalls ?? []);
      logger.info(
        {
          steps: event.steps.length,
          toolCalls: allToolCalls.map((tc) => ({ name: tc.toolName, input: tc.input })),
          textLength: event.text.length,
        },
        'Chat stream finished'
      );
    },
    tools: {
      updatePlan: {
        description: `Modify the practice plan. Supports batch operations in a single call:
- addSection: create a new section (name required)
- addItem: add item to a section (sectionId + name required, optional: targetDurationMinutes, bpm)
- updateItem: update an existing item (itemId required, optional: name, targetDurationMinutes, bpm, status)
- updateSection: rename a section (sectionId + name)
- deleteItem: remove an item (itemId required)
- deleteSection: remove a section and all its items (sectionId required)
- reorderItems: reorder items within a section (sectionId + itemIds in desired order)

For addItem operations that reference a newly added section, run addSection first in a separate call, then addItem in the next call using the returned sectionId.`,
        inputSchema: z.object({
          operations: z.array(z.object({
            type: z.enum(['addSection', 'addItem', 'updateItem', 'updateSection', 'deleteItem', 'deleteSection', 'reorderItems'])
              .describe('The operation type'),
            sectionId: z.string().optional().describe('Section ID (for addItem, updateSection, deleteSection, reorderItems)'),
            sectionName: z.string().optional().describe('Section name (for addSection)'),
            itemId: z.string().optional().describe('Item ID (for updateItem, deleteItem)'),
            name: z.string().optional().describe('Name for the section or item'),
            targetDurationMinutes: z.number().nullable().optional().describe('Target duration in minutes'),
            bpm: z.number().nullable().optional().describe('BPM/tempo'),
            status: z.enum(['pending', 'completed']).optional().describe('Item status'),
            itemIds: z.array(z.string()).optional().describe('Item IDs in desired order (for reorderItems)'),
          })),
        }),
        execute: async ({ operations }: { operations: PlanOperation[] }) => {
          if (!planId) return { error: 'No active plan' };
          const normalized = operations.map((op) => ({
            ...op,
            name: op.type === 'addSection' ? (op.sectionName ?? op.name) : op.name,
          }));
          return executePlanOperations(userId, planId, normalized);
        },
      },
    },
  });
}
