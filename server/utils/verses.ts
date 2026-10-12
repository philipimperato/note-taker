import { inArray } from 'drizzle-orm'
import { parseTokens, normalizeRef, displayRef, MAX_VERSES_PER_NOTE, type Token } from '#shared/utils/verses'
import { db } from '../db'
import { verses } from '../db/schema'

type LookupResult = { book: string; chapter: number; verseStart: number; verseEnd: number; text: string; translation: string }

const ESV_ENDPOINT = 'https://api.esv.org/v3/passage/text/'
const LOOKUP_TIMEOUT_MS = 4000
const LOOKUP_CONCURRENCY = 4
const MISS_TTL_MS = 60 * 60 * 1000
let warnedNoKey = false

// References the API said do not exist (e.g. Matthew 99:1). Remembered per instance so a
// repeated save does not re-spend API quota on the same miss.
const misses = new Map<string, number>()
const isRecentMiss = (ref: string) => (misses.get(ref) ?? 0) > Date.now() - MISS_TTL_MS

/**
 * Crossway ESV API (https://api.esv.org). Free key, ESV only.
 * Returns null for an unknown reference or when ESV_API_KEY is not configured.
 */
async function lookupVerse(t: Token): Promise<LookupResult | null> {
  const key = process.env.ESV_API_KEY
  if (!key) {
    if (!warnedNoKey) {
      console.warn('[verses] ESV_API_KEY is not set; verse tokens will render as "Could not find"')
      warnedNoKey = true
    }
    return null
  }

  const params = new URLSearchParams({
    q: displayRef(t),
    'include-headings': 'false',
    'include-footnotes': 'false',
    'include-verse-numbers': 'false',
    'include-short-copyright': 'false',
    'include-passage-references': 'false',
    'indent-paragraphs': '0',
    'indent-poetry': 'false',
  })

  try {
    const res = await $fetch<{ canonical?: string; passages?: string[] }>(`${ESV_ENDPOINT}?${params}`, {
      headers: { Authorization: `Token ${key}` },
      timeout: LOOKUP_TIMEOUT_MS,
      retry: 0,
    })
    const raw = res.passages?.[0]?.replace(/\s+/g, ' ').trim()
    if (!raw) return null
    return { book: t.book, chapter: t.chapter, verseStart: t.verseStart, verseEnd: t.verseEnd, text: raw, translation: 'ESV' }
  } catch (e) {
    console.warn('[verses] ESV lookup failed for', displayRef(t), (e as Error).message)
    return null
  }
}

/** Distinct verse references in a note, by normalized key. */
export function distinctRefs(body: string) {
  const byRef = new Map<string, Token>()
  for (const t of parseTokens(body)) byRef.set(normalizeRef(t), t)
  return byRef
}

/** Called on Save. Resolves uncached references and stores the hits. Never throws on a miss. */
export async function cacheVerses(body: string) {
  const byRef = distinctRefs(body)
  if (!byRef.size) return
  if (byRef.size > MAX_VERSES_PER_NOTE) {
    throw createError({ statusCode: 422, statusMessage: `At most ${MAX_VERSES_PER_NOTE} verse references per note` })
  }
  const refs = [...byRef.keys()]
  const cached = await db.select({ reference: verses.reference }).from(verses).where(inArray(verses.reference, refs))
  const have = new Set(cached.map((c) => c.reference))
  const todo = refs.filter((r) => !have.has(r) && !isRecentMiss(r))

  // Small concurrency so one save cannot tie up the function or hammer the API.
  for (let i = 0; i < todo.length; i += LOOKUP_CONCURRENCY) {
    await Promise.all(
      todo.slice(i, i + LOOKUP_CONCURRENCY).map(async (ref) => {
        const result = await lookupVerse(byRef.get(ref)!)
        if (!result) {
          misses.set(ref, Date.now())
          return
        }
        await db.insert(verses).values({ reference: ref, ...result }).onConflictDoNothing()
      }),
    )
  }
}

/** Called at render time. The client expands tokens into callouts from this map. */
export async function versesFor(body: string) {
  const refs = [...new Set(parseTokens(body).map(normalizeRef))]
  if (!refs.length) return {}
  const rows = await db.select().from(verses).where(inArray(verses.reference, refs))
  return Object.fromEntries(rows.map((v) => [v.reference, v]))
}
