import { pgSchema, uuid, text } from 'drizzle-orm/pg-core'

// Owned and migrated by Neon Auth. Declared only for typed joins from app code.
// This file is deliberately NOT in drizzle.config.ts's `schema` glob, so drizzle-kit never
// tries to create or alter it. The FK from note.user_id is hand-written in the first migration.
export const neonAuth = pgSchema('neon_auth')
export const authUsers = neonAuth.table('user', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
})
