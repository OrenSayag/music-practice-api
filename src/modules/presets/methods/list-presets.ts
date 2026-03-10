import { eq, asc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practicePresets, presetSections, presetItems } from '../../../db/schema.js';
import type { PresetResponse } from '../dto.js';

export async function listPresets(userId: string): Promise<PresetResponse[]> {
  const presets = await db.query.practicePresets.findMany({
    where: eq(practicePresets.userId, userId),
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
    orderBy: [asc(practicePresets.createdAt)],
  });

  return presets.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.name,
    createdAt: p.createdAt.toISOString(),
    sections: p.sections.map((s) => ({
      id: s.id,
      presetId: s.presetId,
      name: s.name,
      sortOrder: s.sortOrder,
      items: s.items.map((i) => ({
        id: i.id,
        sectionId: i.sectionId,
        name: i.name,
        targetDurationMinutes: i.targetDurationMinutes,
        bpm: i.bpm,
        sortOrder: i.sortOrder,
      })),
    })),
  }));
}
