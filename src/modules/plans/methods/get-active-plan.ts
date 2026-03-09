import { eq, and, asc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practicePlans, planSections, planItems } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import type { PlanResponse } from '../dto.js';

export async function getActivePlan(userId: string): Promise<PlanResponse> {
  const plan = await db.query.practicePlans.findFirst({
    where: and(
      eq(practicePlans.userId, userId),
      eq(practicePlans.isActive, true)
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
    throw new NotFoundException('No active plan found');
  }

  return {
    id: plan.id,
    userId: plan.userId,
    name: plan.name,
    isActive: plan.isActive,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    sections: plan.sections.map((s) => ({
      id: s.id,
      planId: s.planId,
      name: s.name,
      sortOrder: s.sortOrder,
      createdAt: s.createdAt.toISOString(),
      items: s.items.map((i) => ({
        id: i.id,
        sectionId: i.sectionId,
        name: i.name,
        targetDurationMinutes: i.targetDurationMinutes,
        bpm: i.bpm,
        status: i.status as 'pending' | 'completed',
        sortOrder: i.sortOrder,
        createdAt: i.createdAt.toISOString(),
      })),
    })),
  };
}
