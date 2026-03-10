import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { practicePresets } from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';

export async function deletePreset(
  userId: string,
  presetId: string
): Promise<void> {
  const preset = await db.query.practicePresets.findFirst({
    where: and(
      eq(practicePresets.id, presetId),
      eq(practicePresets.userId, userId)
    ),
  });

  if (!preset) {
    throw new NotFoundException('Preset not found');
  }

  await db.delete(practicePresets).where(eq(practicePresets.id, presetId));
}
