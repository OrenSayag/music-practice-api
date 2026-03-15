import { db } from '../../../db/index.js';
import {
  practiceSessions,
  practiceSessionItems,
  practicePresets,
  presetSections,
  presetItems,
  practicePlans,
  planSections,
  planItems,
  userTags,
  sessionTags,
} from '../../../db/schema.js';
import { logger } from '../../../utils/logger.js';

export async function seedGuestData(userId: string): Promise<void> {
  try {
    const tags = await createTags(userId);
    const presetIds = await createPresets(userId);
    await createActivePlan(userId);
    await createSessions(userId, tags);
    logger.info({ userId, presetCount: presetIds.length }, 'Seeded guest data');
  } catch (error) {
    logger.error({ error, userId }, 'Failed to seed guest data');
  }
}

async function createTags(userId: string) {
  const tagData = [
    { userId, name: 'Piano', color: 'cyan' },
    { userId, name: 'Scales', color: 'green' },
    { userId, name: 'Technique', color: 'amber' },
    { userId, name: 'Sight Reading', color: 'red' },
  ] as const;

  return db.insert(userTags).values([...tagData]).returning();
}

async function createPresets(userId: string) {
  const presets = [
    {
      name: 'Quick Warm-Up',
      sections: [
        {
          name: 'Warm Up',
          sortOrder: 0,
          items: [
            { name: 'Chromatic scales', targetDurationMinutes: 5, bpm: 80, sortOrder: 0 },
            { name: 'Finger stretches', targetDurationMinutes: 5, sortOrder: 1 },
          ],
        },
        {
          name: 'Technique',
          sortOrder: 1,
          items: [
            { name: 'Arpeggios', targetDurationMinutes: 10, bpm: 100, sortOrder: 0 },
            { name: 'Chord progressions', targetDurationMinutes: 10, sortOrder: 1 },
          ],
        },
      ],
    },
    {
      name: 'Full Practice',
      sections: [
        {
          name: 'Warm Up',
          sortOrder: 0,
          items: [
            { name: 'Major scales (all keys)', targetDurationMinutes: 10, bpm: 90, sortOrder: 0 },
            { name: 'Minor scales (all keys)', targetDurationMinutes: 10, bpm: 90, sortOrder: 1 },
          ],
        },
        {
          name: 'Technique',
          sortOrder: 1,
          items: [
            { name: 'Arpeggios', targetDurationMinutes: 15, bpm: 110, sortOrder: 0 },
            { name: 'Octave exercises', targetDurationMinutes: 10, bpm: 100, sortOrder: 1 },
            { name: 'Hanon exercises', targetDurationMinutes: 15, bpm: 120, sortOrder: 2 },
          ],
        },
        {
          name: 'Repertoire',
          sortOrder: 2,
          items: [
            { name: 'Current piece - slow practice', targetDurationMinutes: 20, bpm: 60, sortOrder: 0 },
            { name: 'Current piece - full tempo', targetDurationMinutes: 15, bpm: 120, sortOrder: 1 },
            { name: 'Sight reading', targetDurationMinutes: 10, sortOrder: 2 },
          ],
        },
      ],
    },
    {
      name: 'Sight Reading Focus',
      sections: [
        {
          name: 'Warm Up',
          sortOrder: 0,
          items: [
            { name: 'Scale patterns', targetDurationMinutes: 10, bpm: 80, sortOrder: 0 },
          ],
        },
        {
          name: 'Sight Reading',
          sortOrder: 1,
          items: [
            { name: 'Easy pieces', targetDurationMinutes: 15, bpm: 70, sortOrder: 0 },
            { name: 'Medium pieces', targetDurationMinutes: 15, bpm: 80, sortOrder: 1 },
            { name: 'Challenging pieces', targetDurationMinutes: 15, bpm: 60, sortOrder: 2 },
          ],
        },
      ],
    },
  ];

  const createdPresets: string[] = [];

  for (const preset of presets) {
    const [createdPreset] = await db
      .insert(practicePresets)
      .values({ userId, name: preset.name })
      .returning();

    createdPresets.push(createdPreset.id);

    for (const section of preset.sections) {
      const [createdSection] = await db
        .insert(presetSections)
        .values({
          presetId: createdPreset.id,
          name: section.name,
          sortOrder: section.sortOrder,
        })
        .returning();

      await db.insert(presetItems).values(
        section.items.map((item) => ({
          sectionId: createdSection.id,
          name: item.name,
          targetDurationMinutes: item.targetDurationMinutes,
          bpm: item.bpm,
          sortOrder: item.sortOrder,
        })),
      );
    }
  }

  return createdPresets;
}

async function createActivePlan(userId: string) {
  const [plan] = await db
    .insert(practicePlans)
    .values({ userId, name: "Today's Practice" })
    .returning();

  const sections = [
    {
      name: 'Warm Up',
      sortOrder: 0,
      items: [
        { name: 'Chromatic scales', targetDurationMinutes: 5, bpm: 80, sortOrder: 0 },
        { name: 'Major scales (C, G, D)', targetDurationMinutes: 10, bpm: 90, sortOrder: 1 },
      ],
    },
    {
      name: 'Technique',
      sortOrder: 1,
      items: [
        { name: 'Arpeggios', targetDurationMinutes: 10, bpm: 100, sortOrder: 0 },
        { name: 'Hanon exercises No. 1-3', targetDurationMinutes: 15, bpm: 120, sortOrder: 1 },
        { name: 'Octave exercises', targetDurationMinutes: 10, bpm: 100, sortOrder: 2 },
      ],
    },
    {
      name: 'Repertoire',
      sortOrder: 2,
      items: [
        { name: 'Nocturne - slow practice (mm. 1-16)', targetDurationMinutes: 15, bpm: 60, sortOrder: 0 },
        { name: 'Nocturne - full tempo', targetDurationMinutes: 15, bpm: 110, sortOrder: 1 },
        { name: 'Sight reading', targetDurationMinutes: 10, sortOrder: 2 },
      ],
    },
  ];

  for (const section of sections) {
    const [createdSection] = await db
      .insert(planSections)
      .values({
        planId: plan.id,
        name: section.name,
        sortOrder: section.sortOrder,
      })
      .returning();

    await db.insert(planItems).values(
      section.items.map((item) => ({
        sectionId: createdSection.id,
        name: item.name,
        targetDurationMinutes: item.targetDurationMinutes,
        bpm: item.bpm,
        sortOrder: item.sortOrder,
      })),
    );
  }
}

async function createSessions(
  userId: string,
  tags: { id: string; name: string }[],
) {
  const now = new Date();
  const today = now.getUTCDay(); // 0=Sunday

  const sessionDefinitions = buildSessionDefinitions(today);

  for (const def of sessionDefinitions) {
    const startedAt = getDateForDayOffset(now, def.dayOffset);
    startedAt.setUTCHours(def.hour, 0, 0, 0);

    const [session] = await db
      .insert(practiceSessions)
      .values({
        userId,
        startedAt,
        durationSeconds: def.durationMinutes * 60,
        name: def.name,
        notes: def.notes,
        status: 'inactive',
        createdAt: startedAt,
      })
      .returning();

    await db.insert(practiceSessionItems).values(
      def.items.map((item, i) => ({
        sessionId: session.id,
        name: item.name,
        section: item.section,
        durationSeconds: item.durationSeconds,
        targetDurationSeconds: item.targetDurationSeconds,
        bpm: item.bpm,
        status: 'done' as const,
        sortOrder: i,
      })),
    );

    // Assign tags to sessions
    const sessionTagIds = def.tagIndices
      .filter((i) => i < tags.length)
      .map((i) => tags[i].id);

    if (sessionTagIds.length > 0) {
      await db.insert(sessionTags).values(
        sessionTagIds.map((tagId) => ({
          sessionId: session.id,
          tagId,
        })),
      );
    }
  }
}

interface SessionItem {
  name: string;
  section: string;
  durationSeconds: number;
  targetDurationSeconds: number;
  bpm?: number;
}

interface SessionDefinition {
  dayOffset: number;
  hour: number;
  durationMinutes: number;
  name: string;
  notes?: string;
  tagIndices: number[];
  items: SessionItem[];
}

function buildSessionDefinitions(today: number): SessionDefinition[] {
  return [
    {
      dayOffset: -6,
      hour: 9,
      durationMinutes: 90,
      name: 'Morning warm-up & scales',
      notes: 'Focused on C major and A minor scales. Good progress on speed.',
      tagIndices: [0, 1], // Piano, Scales
      items: [
        { name: 'Chromatic scales', section: 'Warm Up', durationSeconds: 600, targetDurationSeconds: 600, bpm: 80 },
        { name: 'C Major scale', section: 'Scales', durationSeconds: 900, targetDurationSeconds: 900, bpm: 100 },
        { name: 'A Minor scale', section: 'Scales', durationSeconds: 900, targetDurationSeconds: 900, bpm: 100 },
        { name: 'Arpeggios', section: 'Technique', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 110 },
        { name: 'Chord voicings', section: 'Technique', durationSeconds: 900, targetDurationSeconds: 900 },
      ],
    },
    {
      dayOffset: -5,
      hour: 18,
      durationMinutes: 120,
      name: 'Evening practice - repertoire',
      notes: 'Worked through Chopin Nocturne. Tricky passage in measure 32.',
      tagIndices: [0], // Piano
      items: [
        { name: 'Finger stretches', section: 'Warm Up', durationSeconds: 300, targetDurationSeconds: 300 },
        { name: 'Scales warm-up', section: 'Warm Up', durationSeconds: 600, targetDurationSeconds: 600, bpm: 90 },
        { name: 'Nocturne - slow practice', section: 'Repertoire', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 60 },
        { name: 'Nocturne - hands separate', section: 'Repertoire', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 80 },
        { name: 'Nocturne - full tempo', section: 'Repertoire', durationSeconds: 1200, targetDurationSeconds: 1500, bpm: 120 },
        { name: 'Sight reading exercises', section: 'Sight Reading', durationSeconds: 1200, targetDurationSeconds: 1200 },
      ],
    },
    {
      dayOffset: -4,
      hour: 10,
      durationMinutes: 60,
      name: 'Technique fundamentals',
      tagIndices: [2], // Technique
      items: [
        { name: 'Chord transitions', section: 'Warm Up', durationSeconds: 600, targetDurationSeconds: 600 },
        { name: 'Trills & ornaments', section: 'Technique', durationSeconds: 900, targetDurationSeconds: 900, bpm: 80 },
        { name: 'Staccato exercises', section: 'Technique', durationSeconds: 900, targetDurationSeconds: 1200, bpm: 100 },
        { name: 'Legato passages', section: 'Technique', durationSeconds: 600, targetDurationSeconds: 600, bpm: 90 },
      ],
    },
    {
      dayOffset: -3,
      hour: 14,
      durationMinutes: 180,
      name: 'Long practice - technique deep dive',
      notes: 'Extended session focused on Hanon exercises and scale speed.',
      tagIndices: [0, 1], // Piano, Scales
      items: [
        { name: 'Major scales (all keys)', section: 'Warm Up', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 100 },
        { name: 'Minor scales (all keys)', section: 'Warm Up', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 100 },
        { name: 'Hanon No. 1-5', section: 'Technique', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 120 },
        { name: 'Hanon No. 6-10', section: 'Technique', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 110 },
        { name: 'Octave exercises', section: 'Technique', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 100 },
        { name: 'Trill exercises', section: 'Technique', durationSeconds: 900, targetDurationSeconds: 900, bpm: 130 },
        { name: 'Repertoire run-through', section: 'Repertoire', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 110 },
      ],
    },
    {
      dayOffset: -2,
      hour: 11,
      durationMinutes: 90,
      name: 'Sight reading session',
      tagIndices: [0, 3], // Piano, Sight Reading
      items: [
        { name: 'Scale patterns', section: 'Warm Up', durationSeconds: 600, targetDurationSeconds: 600, bpm: 80 },
        { name: 'Easy sight reading', section: 'Sight Reading', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 70 },
        { name: 'Medium sight reading', section: 'Sight Reading', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 80 },
        { name: 'Challenging sight reading', section: 'Sight Reading', durationSeconds: 1200, targetDurationSeconds: 1500, bpm: 60 },
        { name: 'Review difficult passages', section: 'Sight Reading', durationSeconds: 600, targetDurationSeconds: 600 },
      ],
    },
    {
      dayOffset: -1,
      hour: 16,
      durationMinutes: 150,
      name: 'Mixed practice - piano & guitar',
      notes: 'Alternated between instruments. Guitar fingerpicking improving.',
      tagIndices: [0, 2], // Piano, Technique
      items: [
        { name: 'Piano scales', section: 'Warm Up', durationSeconds: 600, targetDurationSeconds: 600, bpm: 90 },
        { name: 'Piano arpeggios', section: 'Technique', durationSeconds: 900, targetDurationSeconds: 900, bpm: 110 },
        { name: 'Nocturne practice', section: 'Repertoire', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 100 },
        { name: 'Chord voicing drills', section: 'Technique', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 80 },
        { name: 'Pedaling exercises', section: 'Technique', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 90 },
        { name: 'Dynamics control', section: 'Technique', durationSeconds: 1200, targetDurationSeconds: 1200, bpm: 120 },
        { name: 'Cool down - free play', section: 'Cool Down', durationSeconds: 900, targetDurationSeconds: 900 },
      ],
    },
    {
      dayOffset: 0,
      hour: 8,
      durationMinutes: 360,
      name: 'Weekend marathon session',
      notes: 'Full day practice. Covered everything from basics to performance prep.',
      tagIndices: [0, 1, 2, 3], // All tags
      items: [
        { name: 'Stretches & warm-up', section: 'Warm Up', durationSeconds: 900, targetDurationSeconds: 900 },
        { name: 'All major scales', section: 'Scales', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 110 },
        { name: 'All minor scales', section: 'Scales', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 110 },
        { name: 'Hanon exercises', section: 'Technique', durationSeconds: 2700, targetDurationSeconds: 2700, bpm: 120 },
        { name: 'Octave & chord drills', section: 'Technique', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 100 },
        { name: 'Nocturne - performance prep', section: 'Repertoire', durationSeconds: 2700, targetDurationSeconds: 3600, bpm: 110 },
        { name: 'Sight reading block', section: 'Sight Reading', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 75 },
        { name: 'Etude practice', section: 'Repertoire', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 90 },
        { name: 'Improvisation over chord changes', section: 'Repertoire', durationSeconds: 1800, targetDurationSeconds: 1800, bpm: 100 },
        { name: 'Free improvisation', section: 'Cool Down', durationSeconds: 1200, targetDurationSeconds: 1200 },
      ],
    },
  ];
}

function getDateForDayOffset(now: Date, dayOffset: number): Date {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date;
}
