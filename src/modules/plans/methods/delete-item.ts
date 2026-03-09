import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { planItems } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';

export async function deleteItem(
  userId: string,
  itemId: string
): Promise<void> {
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

  await db.delete(planItems).where(eq(planItems.id, itemId));
}
