import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practicePlans, planSections, planItems } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';

export const resetItems = async (userId: string, planId: string): Promise<void> => {
  const plan = await db.query.practicePlans.findFirst({
    where: and(eq(practicePlans.id, planId), eq(practicePlans.userId, userId)),
    with: { sections: { columns: { id: true } } },
  });

  if (!plan) {
    throw new NotFoundException('Plan not found');
  }

  const sectionIds = plan.sections.map((s) => s.id);
  if (sectionIds.length === 0) return;

  await db
    .update(planItems)
    .set({ status: 'pending' })
    .where(inArray(planItems.sectionId, sectionIds));
};
