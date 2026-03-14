import { eq, and, asc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practicePresets,
  presetSections,
  presetItems,
  practicePlans,
  planSections,
  planItems,
} from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { PlanResponse } from '../../plans/dto.js';

export async function loadPreset(
  userId: string,
  presetId: string
): Promise<PlanResponse> {
  const preset = await db.query.practicePresets.findFirst({
    where: and(
      eq(practicePresets.id, presetId),
      eq(practicePresets.userId, userId)
    ),
    with: {
      sections: {
        orderBy: [asc(presetSections.sortOrder)],
        with: {
          items: {
            orderBy: [asc(presetItems.sortOrder)],
          },
        },
      },
    },
  });

  if (!preset) {
    throw new NotFoundException('Preset not found');
  }

  // Delete existing plans (cascade deletes sections/items)
  await db
    .delete(practicePlans)
    .where(eq(practicePlans.userId, userId));

  // Create new plan from preset
  const [plan] = await db
    .insert(practicePlans)
    .values({
      userId,
      name: preset.name,
    })
    .returning();

  const resultSections: PlanResponse['sections'] = [];

  for (const section of preset.sections) {
    const [newSection] = await db
      .insert(planSections)
      .values({
        planId: plan.id,
        name: section.name,
        sortOrder: section.sortOrder,
      })
      .returning();

    const sectionItems = [];

    for (const item of section.items) {
      const [newItem] = await db
        .insert(planItems)
        .values({
          sectionId: newSection.id,
          name: item.name,
          targetDurationMinutes: item.targetDurationMinutes,
          bpm: item.bpm,
          sortOrder: item.sortOrder,
        })
        .returning();

      sectionItems.push({
        id: newItem.id,
        sectionId: newItem.sectionId,
        name: newItem.name,
        targetDurationMinutes: newItem.targetDurationMinutes,
        bpm: newItem.bpm,
        status: newItem.status as 'pending' | 'completed',
        sortOrder: newItem.sortOrder,
        createdAt: newItem.createdAt.toISOString(),
      });
    }

    resultSections.push({
      id: newSection.id,
      planId: newSection.planId,
      name: newSection.name,
      sortOrder: newSection.sortOrder,
      createdAt: newSection.createdAt.toISOString(),
      items: sectionItems,
    });
  }

  return {
    id: plan.id,
    userId: plan.userId,
    name: plan.name,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    sections: resultSections,
  };
}
