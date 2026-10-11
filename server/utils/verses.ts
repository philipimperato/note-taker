import { inArray } from 'drizzle-orm'
import { db } from '../db'
import { verses } from '../db/schema'

// Matches [John 3:16], [1 John 3:16], [Song of Songs 2:1], [Psalm 23:1-3]
const TOKEN = /\[([1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+):(\d+)(?:-(\d+))?\]/g

export type Token = {
  raw: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number
}

export function parseTokens(body: string): Token[] {
  return [...body.matchAll(TOKEN)].map((m) => ({
    raw: m[0],
    book: m[1]!.trim(),
    chapter: Number(m[2]),
    verseStart: Number(m[3]),
    verseEnd: Number(m[4] ?? m[3]),
  }))
}

export function normalizeRef(t: Token) {
  const book = t.book.toLowerCase().replace(/\s+/g, '')
  const range = t.verseEnd === t.verseStart ? `${t.verseStart}` : `${t.verseStart}-${t.verseEnd}`
  return `${book}/${t.chapter}/${range}`
}

type LookupResult = { book: string; chapter: number; verseStart: number; verseEnd: number; text: string }

// TODO: wire to the chosen scripture API. Returning null means the token renders as "Couldn't find …".
async function lookupVerse(_t: Token): Promise<LookupResult | null> {
  return null
}

/** Called on Save. Resolves uncached references and stores the hits. Never throws on a miss. */
export async function cacheVerses(body: string) {
  const tokens = parseTokens(body)
  if (!tokens.length) return
  const refs = [...new Set(tokens.map(normalizeRef))]
  const cached = await db.select({ reference: verses.reference }).from(verses).where(inArray(verses.reference, refs))
  const have = new Set(cached.map((c) => c.reference))

  for (const t of tokens) {
    const ref = normalizeRef(t)
    if (have.has(ref)) continue
    const result = await lookupVerse(t)
    if (!result) continue
    await db.insert(verses).values({ reference: ref, ...result }).onConflictDoNothing()
    have.add(ref)
  }
}

/** Called at render time. The client expands tokens into callouts from this map. */
export async function versesFor(body: string) {
  const refs = [...new Set(parseTokens(body).map(normalizeRef))]
  if (!refs.length) return {}
  const rows = await db.select().from(verses).where(inArray(verses.reference, refs))
  return Object.fromEntries(rows.map((v) => [v.reference, v]))
}
