import { inArray } from 'drizzle-orm'
import { parseTokens, normalizeRef, displayRef, type Token } from '#shared/utils/verses'
import { db } from '../db'
import { verses } from '../db/schema'

type LookupResult = { book: string; chapter: number; verseStart: number; verseEnd: number; text: string; translation: string }

const ESV_ENDPOINT = 'https://api.esv.org/v3/passage/text/'
let warnedNoKey = false

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
    })
    const raw = res.passages?.[0]?.replace(/\s+/g, ' ').trim()
    if (!raw) return null
    return { book: t.book, chapter: t.chapter, verseStart: t.verseStart, verseEnd: t.verseEnd, text: raw, translation: 'ESV' }
  } catch (e) {
    console.warn('[verses] ESV lookup failed for', displayRef(t), (e as Error).message)
    return null
  }
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
