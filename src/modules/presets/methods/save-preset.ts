import { eq, and, asc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practicePlans,
  planSections,
  planItems,
  practicePresets,
  presetSections,
  presetItems,
} from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { SavePresetRequest, PresetResponse } from '../dto.js';

export async function savePreset(
  userId: string,
  input: SavePresetRequest
): Promise<PresetResponse> {
  const plan = await db.query.practicePlans.findFirst({
    where: and(
      eq(practicePlans.id, input.planId),
      eq(practicePlans.userId, userId)
    ),
    with: {
      sections: {
        orderBy: [asc(planSections.sortOrder)],
        with: {
          items: {
            orderBy: [asc(planItems.sortOrder)],
          },
        },
      },
    },
  });

  if (!plan) {
    throw new NotFoundException('Plan not found');
  }

  const [preset] = await db
    .insert(practicePresets)
    .values({
      userId,
      name: input.name ?? plan.name,
    })
    .returning();

  const resultSections: PresetResponse['sections'] = [];

  for (const section of plan.sections) {
    const [newSection] = await db
      .insert(presetSections)
      .values({
        presetId: preset.id,
        name: section.name,
        sortOrder: section.sortOrder,
      })
      .returning();

    const sectionItems = [];

    for (const item of section.items) {
      const [newItem] = await db
        .insert(presetItems)
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
        sortOrder: newItem.sortOrder,
      });
    }

    resultSections.push({
      id: newSection.id,
      presetId: newSection.presetId,
      name: newSection.name,
      sortOrder: newSection.sortOrder,
      items: sectionItems,
    });
  }

  return {
    id: preset.id,
    userId: preset.userId,
    name: preset.name,
    createdAt: preset.createdAt.toISOString(),
    sections: resultSections,
  };
}
