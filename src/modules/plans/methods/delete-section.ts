import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { planSections } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';

export async function deleteSection(
  userId: string,
  sectionId: string
): Promise<void> {
  const section = await db.query.planSections.findFirst({
    where: eq(planSections.id, sectionId),
    with: {
      plan: { columns: { userId: true } },
    },
  });

  if (!section || section.plan.userId !== userId) {
    throw new NotFoundException('Section not found');
  }

  await db.delete(planSections).where(eq(planSections.id, sectionId));
}
