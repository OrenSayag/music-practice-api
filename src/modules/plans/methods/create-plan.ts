import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practicePlans } from '../../../db/schema.js';
import type { CreatePlanRequest, PlanResponse } from '../dto.js';

export async function createPlan(
  userId: string,
  input: CreatePlanRequest
): Promise<PlanResponse> {
  // Delete all existing plans for this user (cascade deletes sections/items)
  await db
    .delete(practicePlans)
    .where(eq(practicePlans.userId, userId));

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
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    sections: [],
  };
}
