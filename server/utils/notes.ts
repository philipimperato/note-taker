import { and, eq, isNotNull, ne, lte, desc, between, sql } from 'drizzle-orm'
import { db } from '../db'
import { notes } from '../db/schema'

const hasSavedBody = and(isNotNull(notes.body), ne(notes.body, ''))

/** A draft that has not changed for this long is dropped. */
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000

/** The day's row. A draft untouched for DRAFT_TTL_MS is dropped here (lazy expiry; no cron). */
export async function getNote(userId: string, date: string) {
  const note = await db.query.notes.findFirst({
    where: and(eq(notes.userId, userId), eq(notes.noteDate, date)),
  })
  if (!note) return undefined
  const stale = note.draftBody != null && (!note.draftUpdatedAt || note.draftUpdatedAt.getTime() < Date.now() - DRAFT_TTL_MS)
  if (stale) {
    await discardDraft(userId, date)
    return { ...note, draftBody: null, draftUpdatedAt: null }
  }
  return note
}

/**
 * Autosave. Only called when the text changed on the client. A draft identical to the saved
 * body (or empty with nothing saved) is not a draft, so it is cleared instead of stored.
 */
export async function saveDraft(userId: string, date: string, draft: string) {
  const now = new Date()
  const existing = await db.query.notes.findFirst({
    columns: { body: true },
    where: and(eq(notes.userId, userId), eq(notes.noteDate, date)),
  })
  const sameAsSaved = draft === (existing?.body ?? '')
  if (sameAsSaved) {
    if (existing) await discardDraft(userId, date)
    return { draftUpdatedAt: null }
  }
  await db
    .insert(notes)
    .values({ userId, noteDate: date, draftBody: draft, draftUpdatedAt: now, updatedAt: now })
    .onConflictDoUpdate({
      target: [notes.userId, notes.noteDate],
      set: { draftBody: draft, draftUpdatedAt: now, updatedAt: now },
    })
  return { draftUpdatedAt: now }
}

/** Discard: the only way a draft goes away besides Save and the 24h expiry. */
export async function discardDraft(userId: string, date: string) {
  await db
    .update(notes)
    .set({ draftBody: null, draftUpdatedAt: null, updatedAt: new Date() })
    .where(and(eq(notes.userId, userId), eq(notes.noteDate, date)))
}

export async function publishNote(userId: string, date: string, body: string) {
  const now = new Date()
  await db
    .insert(notes)
    .values({ userId, noteDate: date, body, savedAt: now, updatedAt: now })
    .onConflictDoUpdate({
      target: [notes.userId, notes.noteDate],
      set: { body, draftBody: null, draftUpdatedAt: null, savedAt: now, updatedAt: now },
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
