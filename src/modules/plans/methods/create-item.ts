import { eq, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { planSections, planItems } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { CreateItemRequest } from '../dto.js';

export async function createItem(
  userId: string,
  sectionId: string,
  input: CreateItemRequest
) {
  const section = await db.query.planSections.findFirst({
    where: eq(planSections.id, sectionId),
    with: {
      plan: { columns: { userId: true } },
    },
  });

  if (!section || section.plan.userId !== userId) {
    throw new NotFoundException('Section not found');
  }

  const [maxResult] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${planItems.sortOrder}), -1)` })
    .from(planItems)
    .where(eq(planItems.sectionId, sectionId));

  const [item] = await db
    .insert(planItems)
    .values({
      sectionId,
      name: input.name,
      targetDurationMinutes: input.targetDurationMinutes ?? null,
      bpm: input.bpm ?? null,
      sortOrder: (maxResult?.maxOrder ?? -1) + 1,
    })
    .returning();

  return {
    id: item.id,
    sectionId: item.sectionId,
    name: item.name,
    targetDurationMinutes: item.targetDurationMinutes,
    bpm: item.bpm,
    status: item.status as 'pending' | 'completed',
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
  };
}
