import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practicePlans, planSections } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { CreateSectionRequest } from '../dto.js';

export async function createSection(
  userId: string,
  planId: string,
  input: CreateSectionRequest
) {
  const plan = await db.query.practicePlans.findFirst({
    where: and(
      eq(practicePlans.id, planId),
      eq(practicePlans.userId, userId)
    ),
  });

  if (!plan) {
    throw new NotFoundException('Plan not found');
  }

  // Get max sortOrder for this plan's sections
  const [maxResult] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${planSections.sortOrder}), -1)` })
    .from(planSections)
    .where(eq(planSections.planId, planId));

  const [section] = await db
    .insert(planSections)
    .values({
      planId,
      name: input.name,
      sortOrder: (maxResult?.maxOrder ?? -1) + 1,
    })
    .returning();

  return {
    id: section.id,
    planId: section.planId,
    name: section.name,
    sortOrder: section.sortOrder,
    createdAt: section.createdAt.toISOString(),
    items: [],
  };
}
