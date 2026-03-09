import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { planItems } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { UpdateItemRequest } from '../dto.js';

export async function updateItem(
  userId: string,
  itemId: string,
  input: UpdateItemRequest
) {
  const item = await db.query.planItems.findFirst({
    where: eq(planItems.id, itemId),
    with: {
      section: {
        with: {
          plan: { columns: { userId: true } },
        },
      },
    },
  });

  if (!item || item.section.plan.userId !== userId) {
    throw new NotFoundException('Item not found');
  }

  const updateData: Record<string, unknown> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.targetDurationMinutes !== undefined)
    updateData.targetDurationMinutes = input.targetDurationMinutes;
  if (input.bpm !== undefined) updateData.bpm = input.bpm;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

  if (Object.keys(updateData).length > 0) {
    await db
      .update(planItems)
      .set(updateData)
      .where(eq(planItems.id, itemId));
  }

  const updated = await db.query.planItems.findFirst({
    where: eq(planItems.id, itemId),
  });

  return {
    id: updated!.id,
    sectionId: updated!.sectionId,
    name: updated!.name,
    targetDurationMinutes: updated!.targetDurationMinutes,
    bpm: updated!.bpm,
    status: updated!.status as 'pending' | 'completed',
    sortOrder: updated!.sortOrder,
    createdAt: updated!.createdAt.toISOString(),
  };
}
