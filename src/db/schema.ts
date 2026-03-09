import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  serial,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// -- Auth.js Required Tables --

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  isGuest: boolean('is_guest').notNull().default(false),
  guestId: text('guest_id').unique(),
  weekStartDay: integer('week_start_day').notNull().default(0), // 0=Sunday, 1=Monday
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// -- Practice Sessions --

export const practiceSessions = pgTable('practice_sessions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { mode: 'date' }).notNull(),
  endedAt: timestamp('ended_at', { mode: 'date' }),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const practiceSessionItems = pgTable('practice_session_items', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => practiceSessions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  section: text('section'),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  targetDurationSeconds: integer('target_duration_seconds'),
  bpm: integer('bpm'),
  status: text('status').notNull().default('pending'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const sessionTags = pgTable('session_tags', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => practiceSessions.id, { onDelete: 'cascade' }),
  tag: text('tag').notNull(),
});

// -- Relations --

export const usersRelations = relations(users, ({ many }) => ({
  practiceSessions: many(practiceSessions),
}));

export const practiceSessionsRelations = relations(
  practiceSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [practiceSessions.userId],
      references: [users.id],
    }),
    items: many(practiceSessionItems),
    tags: many(sessionTags),
  })
);

export const practiceSessionItemsRelations = relations(
  practiceSessionItems,
  ({ one }) => ({
    session: one(practiceSessions, {
      fields: [practiceSessionItems.sessionId],
      references: [practiceSessions.id],
    }),
  })
);

export const sessionTagsRelations = relations(sessionTags, ({ one }) => ({
  session: one(practiceSessions, {
    fields: [sessionTags.sessionId],
    references: [practiceSessions.id],
  }),
}));
