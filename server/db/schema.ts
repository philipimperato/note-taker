import { pgTable, text, integer, date, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

export const notes = pgTable(
  'note',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // FK to neon_auth.user(id) ON DELETE CASCADE is declared in drizzle/0000_init.sql,
    // not here, so drizzle-kit never touches the Neon-owned schema.
    userId: uuid('user_id').notNull(),
    noteDate: date('note_date', { mode: 'string' }).notNull(), // 'YYYY-MM-DD', local calendar day
    body: text('body'),            // saved raw text incl. [Book C:V] tokens; NULL = never saved
    draftBody: text('draft_body'), // autosave; NULL = no pending draft
    savedAt: timestamp('saved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('note_user_date_uq').on(t.userId, t.noteDate)],
)

export const verses = pgTable('verse', {
  reference: text('reference').primaryKey(), // normalized, e.g. 'john/3/16', 'psalm/23/1-3'
  book: text('book').notNull(),
  chapter: integer('chapter').notNull(),
  verseStart: integer('verse_start').notNull(),
  verseEnd: integer('verse_end').notNull(),
  text: text('text').notNull(),
  translation: text('translation').notNull().default('KJV'),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Note = typeof notes.$inferSelect
export type Verse = typeof verses.$inferSelect
