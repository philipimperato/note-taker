import { and, eq, isNotNull, ne, lte, desc, between, sql } from 'drizzle-orm'
import { db } from '../db'
import { notes } from '../db/schema'

const hasSavedBody = and(isNotNull(notes.body), ne(notes.body, ''))

export function getNote(userId: string, date: string) {
  return db.query.notes.findFirst({
    where: and(eq(notes.userId, userId), eq(notes.noteDate, date)),
  })
}

export async function saveDraft(userId: string, date: string, draft: string) {
  const now = new Date()
  await db
    .insert(notes)
    .values({ userId, noteDate: date, draftBody: draft, updatedAt: now })
    .onConflictDoUpdate({
      target: [notes.userId, notes.noteDate],
      set: { draftBody: draft, updatedAt: now },
    })
}

export async function publishNote(userId: string, date: string, body: string) {
  const now = new Date()
  await db
    .insert(notes)
    .values({ userId, noteDate: date, body, savedAt: now, updatedAt: now })
    .onConflictDoUpdate({
      target: [notes.userId, notes.noteDate],
      set: { body, draftBody: null, savedAt: now, updatedAt: now },
    })
}

/** Notes list: every saved day, newest first. Preview is derived in the handler. */
export function listSavedNotes(userId: string) {
  return db
    .select({ noteDate: notes.noteDate, body: sql<string>`left(${notes.body}, 300)` })
    .from(notes)
    .where(and(eq(notes.userId, userId), hasSavedBody))
    .orderBy(desc(notes.noteDate))
}

/** Calendar: which days in a month have a saved note. ym is 'YYYY-MM'. */
export async function savedDatesInMonth(userId: string, ym: string) {
  const rows = await db
    .select({ noteDate: notes.noteDate })
    .from(notes)
    .where(and(eq(notes.userId, userId), hasSavedBody, between(notes.noteDate, `${ym}-01`, `${ym}-31`)))
  return rows.map((r) => r.noteDate)
}

/** Streak: consecutive saved days ending today, or ending yesterday if today is still empty. */
export async function streak(userId: string, today: string) {
  const rows = await db
    .select({ noteDate: notes.noteDate })
    .from(notes)
    .where(and(eq(notes.userId, userId), hasSavedBody, lte(notes.noteDate, today)))
    .orderBy(desc(notes.noteDate))

  const dates = new Set(rows.map((r) => r.noteDate))
  const cursor = new Date(`${today}T00:00:00Z`)
  if (!dates.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1)
  let count = 0
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    count++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return count // 0 means the UI shows "Start a new streak"
}


const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const ISO_MONTH = /^\d{4}-\d{2}$/

export function requireDateParam(value: string | undefined, name = 'date') {
  if (!value || !ISO_DATE.test(value) || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${name}, expected YYYY-MM-DD` })
  }
  return value
}

export function requireMonthParam(value: string | undefined) {
  if (!value || !ISO_MONTH.test(value) || Number(value.slice(5)) < 1 || Number(value.slice(5)) > 12) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid month, expected YYYY-MM' })
  }
  return value
}
