import { eq, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  sessionRecordings,
} from '../../../db/schema.js';
import { NotFoundException } from '../../../utils/exceptions.js';
import { putObject, getObject, deleteObject } from '../../../lib/storage.js';
import type { z } from '@hono/zod-openapi';
import type { recordingResponseSchema } from '../dto.js';

type RecordingResponse = z.infer<typeof recordingResponseSchema>;

async function verifySessionOwnership(
  userId: string,
  sessionId: string,
): Promise<void> {
  const [session] = await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.id, sessionId),
        eq(practiceSessions.userId, userId),
      ),
    );

  if (!session) {
    throw new NotFoundException('Session not found');
  }
}

function toResponse(row: typeof sessionRecordings.$inferSelect): RecordingResponse {
  return {
    id: row.id,
    sessionId: row.sessionId,
    fileName: row.fileName,
    durationSeconds: row.durationSeconds,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    isStarred: row.isStarred,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function uploadRecording(
  userId: string,
  sessionId: string,
  file: File,
  durationSeconds: number,
): Promise<RecordingResponse> {
  await verifySessionOwnership(userId, sessionId);

  const recordingId = crypto.randomUUID();
  const ext = file.name?.split('.').pop() ?? 'webm';
  const s3Key = `${userId}/${sessionId}/${recordingId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await putObject(s3Key, buffer, file.type || 'audio/webm');

  const [recording] = await db
    .insert(sessionRecordings)
    .values({
      id: recordingId,
      sessionId,
      fileName: file.name || `recording-${recordingId}.${ext}`,
      durationSeconds,
      fileSize: buffer.byteLength,
      s3Key,
      mimeType: file.type || 'audio/webm',
    })
    .returning();

  return toResponse(recording);
}

export async function listRecordings(
  userId: string,
  sessionId: string,
): Promise<RecordingResponse[]> {
  await verifySessionOwnership(userId, sessionId);

  const rows = await db
    .select()
    .from(sessionRecordings)
    .where(eq(sessionRecordings.sessionId, sessionId));

  return rows.map(toResponse);
}

export async function streamRecording(
  userId: string,
  sessionId: string,
  recordingId: string,
): Promise<{ body: Uint8Array; contentType: string; fileSize: number }> {
  await verifySessionOwnership(userId, sessionId);

  const [recording] = await db
    .select()
    .from(sessionRecordings)
    .where(
      and(
        eq(sessionRecordings.id, recordingId),
        eq(sessionRecordings.sessionId, sessionId),
      ),
    );

  if (!recording) {
    throw new NotFoundException('Recording not found');
  }

  const { body, contentType } = await getObject(recording.s3Key);
  return { body, contentType, fileSize: recording.fileSize };
}

export async function deleteRecording(
  userId: string,
  sessionId: string,
  recordingId: string,
): Promise<void> {
  await verifySessionOwnership(userId, sessionId);

  const [recording] = await db
    .select()
    .from(sessionRecordings)
    .where(
      and(
        eq(sessionRecordings.id, recordingId),
        eq(sessionRecordings.sessionId, sessionId),
      ),
    );

  if (!recording) {
    throw new NotFoundException('Recording not found');
  }

  await deleteObject(recording.s3Key);
  await db
    .delete(sessionRecordings)
    .where(eq(sessionRecordings.id, recordingId));
}

export async function updateRecording(
  userId: string,
  sessionId: string,
  recordingId: string,
  fileName: string,
): Promise<RecordingResponse> {
  await verifySessionOwnership(userId, sessionId);

  const [updated] = await db
    .update(sessionRecordings)
    .set({ fileName })
    .where(
      and(
        eq(sessionRecordings.id, recordingId),
        eq(sessionRecordings.sessionId, sessionId),
      ),
    )
    .returning();

  if (!updated) {
    throw new NotFoundException('Recording not found');
  }

  return toResponse(updated);
}
