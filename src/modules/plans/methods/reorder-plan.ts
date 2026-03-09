import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practicePlans, planSections, planItems } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { ReorderRequest } from '../dto.js';
import { getActivePlan } from './get-active-plan.js';

export async function reorderPlan(
  userId: string,
  planId: string,
  input: ReorderRequest
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

  // Update all sections and items in parallel
  const updates: Promise<unknown>[] = [];

  for (const section of input.sections) {
    updates.push(
      db
        .update(planSections)
        .set({ sortOrder: section.sortOrder })
        .where(eq(planSections.id, section.id))
    );

    if (section.items) {
      for (const item of section.items) {
        const itemUpdate: Record<string, unknown> = {
          sortOrder: item.sortOrder,
        };
        if (item.sectionId) {
          itemUpdate.sectionId = item.sectionId;
        }
        updates.push(
          db
            .update(planItems)
            .set(itemUpdate)
            .where(eq(planItems.id, item.id))
        );
      }
    }
  }

  await Promise.all(updates);

  return getActivePlan(userId);
}
