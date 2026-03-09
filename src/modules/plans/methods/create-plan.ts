import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practicePlans } from '../../../db/schema.js';
import type { CreatePlanRequest, PlanResponse } from '../dto.js';

export async function createPlan(
  userId: string,
  input: CreatePlanRequest
): Promise<PlanResponse> {
  // Deactivate all existing active plans for this user
  await db
    .update(practicePlans)
    .set({ isActive: false, updatedAt: new Date() })
    .where(
      and(eq(practicePlans.userId, userId), eq(practicePlans.isActive, true))
    );

  const [plan] = await db
    .insert(practicePlans)
    .values({
      userId,
      name: input.name ?? "today's plan",
    })
    .returning();

  return {
    id: plan.id,
    userId: plan.userId,
    name: plan.name,
    isActive: plan.isActive,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    sections: [],
  };
}
