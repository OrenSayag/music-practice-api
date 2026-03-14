import { desc, eq, sql, and, lt } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import {
  practiceSessions,
  sessionRecordings,
  sessionTags,
  userTags,
} from '../../../db/schema.js';
import type { ListAllRecordingsResponse } from '../dto.js';

interface ListAllRecordingsParams {
  userId: string;
  cursor?: string;
  limit: number;
  starred?: boolean;
  tagId?: string;
}

export async function listAllRecordings({
  userId,
  cursor,
  limit,
  starred,
  tagId,
}: ListAllRecordingsParams): Promise<ListAllRecordingsResponse> {
  const conditions = [
    eq(practiceSessions.userId, userId),
    eq(practiceSessions.status, 'inactive'),
  ];

  if (cursor) {
    conditions.push(lt(sessionRecordings.createdAt, new Date(cursor)));
  }

  if (starred) {
    conditions.push(eq(sessionRecordings.isStarred, true));
  }

  if (tagId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM ${sessionTags} WHERE ${sessionTags.sessionId} = ${practiceSessions.id} AND ${sessionTags.tagId} = ${tagId})`
    );
  }

  const rows = await db
    .select({
      id: sessionRecordings.id,
      sessionId: sessionRecordings.sessionId,
      fileName: sessionRecordings.fileName,
      durationSeconds: sessionRecordings.durationSeconds,
      fileSize: sessionRecordings.fileSize,
      mimeType: sessionRecordings.mimeType,
      isStarred: sessionRecordings.isStarred,
      createdAt: sessionRecordings.createdAt,
      sessionName: practiceSessions.name,
      sessionStartedAt: practiceSessions.startedAt,
    })
    .from(sessionRecordings)
    .innerJoin(
      practiceSessions,
      eq(sessionRecordings.sessionId, practiceSessions.id)
    )
    .where(and(...conditions))
    .orderBy(desc(sessionRecordings.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  // Batch-fetch session tags for sessions in this page
  const sessionIds = [...new Set(rows.map((r) => r.sessionId))];

  const tagRows = sessionIds.length
    ? await db
        .select({
          sessionId: sessionTags.sessionId,
          tagId: userTags.id,
          tagName: userTags.name,
          tagColor: userTags.color,
        })
        .from(sessionTags)
        .innerJoin(userTags, eq(sessionTags.tagId, userTags.id))
        .where(sql`${sessionTags.sessionId} IN ${sessionIds}`)
    : [];

  const tagMap = new Map<
    string,
    { id: string; name: string; color: string }[]
  >();
  for (const row of tagRows) {
    const tags = tagMap.get(row.sessionId) ?? [];
    tags.push({
      id: row.tagId,
      name: row.tagName,
      color: row.tagColor,
    });
    tagMap.set(row.sessionId, tags);
  }

  const recordings = rows.map((row) => ({
    id: row.id,
    sessionId: row.sessionId,
    fileName: row.fileName,
    durationSeconds: row.durationSeconds,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    isStarred: row.isStarred,
    createdAt: row.createdAt.toISOString(),
    session: {
      name: row.sessionName,
      startedAt: row.sessionStartedAt.toISOString(),
      tags: (tagMap.get(row.sessionId) ?? []) as {
        id: string;
        name: string;
        color: 'green' | 'amber' | 'cyan' | 'red';
      }[],
    },
  }));

  const nextCursor = hasMore
    ? rows[rows.length - 1].createdAt.toISOString()
    : null;

  return { recordings, nextCursor };
}
