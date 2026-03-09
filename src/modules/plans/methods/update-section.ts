import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { planSections } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { UpdateSectionRequest } from '../dto.js';

export async function updateSection(
  userId: string,
  sectionId: string,
  input: UpdateSectionRequest
) {
  // Verify ownership through plan
  const section = await db.query.planSections.findFirst({
    where: eq(planSections.id, sectionId),
    with: {
      plan: { columns: { userId: true } },
    },
  });

  if (!section || section.plan.userId !== userId) {
    throw new NotFoundException('Section not found');
  }

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

  if (Object.keys(updateData).length > 0) {
    await db
      .update(planSections)
      .set(updateData)
      .where(eq(planSections.id, sectionId));
  }

  const updated = await db.query.planSections.findFirst({
    where: eq(planSections.id, sectionId),
    with: { items: true },
  });

  return {
    id: updated!.id,
    planId: updated!.planId,
    name: updated!.name,
    sortOrder: updated!.sortOrder,
    createdAt: updated!.createdAt.toISOString(),
    items: updated!.items.map((i) => ({
      id: i.id,
      sectionId: i.sectionId,
      name: i.name,
      targetDurationMinutes: i.targetDurationMinutes,
      bpm: i.bpm,
      status: i.status as 'pending' | 'completed',
      sortOrder: i.sortOrder,
      createdAt: i.createdAt.toISOString(),
    })),
  };
}
