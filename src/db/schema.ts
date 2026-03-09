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

// -- Practice Plans --

export const practicePlans = pgTable('practice_plans', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default("today's plan"),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const planSections = pgTable('plan_sections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  planId: text('plan_id')
    .notNull()
    .references(() => practicePlans.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const planItems = pgTable('plan_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sectionId: text('section_id')
    .notNull()
    .references(() => planSections.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  targetDurationMinutes: integer('target_duration_minutes'),
  bpm: integer('bpm'),
  status: text('status').notNull().default('pending'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// -- Chat Messages --

export const chatMessages = pgTable('chat_messages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  planId: text('plan_id').references(() => practicePlans.id, {
    onDelete: 'set null',
  }),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// -- Relations --

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  plan: one(practicePlans, {
    fields: [chatMessages.planId],
    references: [practicePlans.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  practiceSessions: many(practiceSessions),
  practicePlans: many(practicePlans),
  chatMessages: many(chatMessages),
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

export const practicePlansRelations = relations(
  practicePlans,
  ({ one, many }) => ({
    user: one(users, {
      fields: [practicePlans.userId],
      references: [users.id],
    }),
    sections: many(planSections),
  })
);

export const planSectionsRelations = relations(
  planSections,
  ({ one, many }) => ({
    plan: one(practicePlans, {
      fields: [planSections.planId],
      references: [practicePlans.id],
    }),
    items: many(planItems),
  })
);

export const planItemsRelations = relations(planItems, ({ one }) => ({
  section: one(planSections, {
    fields: [planItems.sectionId],
    references: [planSections.id],
  }),
}));
