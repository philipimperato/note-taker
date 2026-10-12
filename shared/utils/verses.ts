// Verse token parsing shared by the server (resolve + cache) and the client (highlight + render).

import { canonicalBook } from './bible-books'

// Matches [John 3:16], [1 John 3:16], [Song of Songs 2:1], [Psalm 23:1-3], [1 Jn 3:16].
// The book must resolve to a real Bible book (see parseTokens); anything else is plain text.
export const VERSE_TOKEN = /\[((?:[1-3]|I{1,3})?\s?[A-Za-z]+\.?(?:\s[A-Za-z]+\.?)*)\s+(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?\]/g

export const MAX_VERSES_PER_NOTE = 20
export const MAX_RANGE = 50

export type Token = {
  raw: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number
}

/** Tokens whose book is a real Bible book and whose numbers are sane. Others are left as text. */
export function parseTokens(body: string): Token[] {
  const out: Token[] = []
  for (const m of body.matchAll(VERSE_TOKEN)) {
    const book = canonicalBook(m[1]!.trim())
    if (!book) continue
    const chapter = Number(m[2])
    const verseStart = Number(m[3])
    const verseEnd = Number(m[4] ?? m[3])
    if (chapter < 1 || verseStart < 1 || verseEnd < verseStart || verseEnd - verseStart > MAX_RANGE) continue
    out.push({ raw: m[0], book, chapter, verseStart, verseEnd })
  }
  return out
}

/** Same filter, exposed for the editor overlay: does this raw match count as a token? */
export function isVerseToken(raw: string) {
  return parseTokens(raw).length === 1
}

export function normalizeRef(t: Token) {
  const book = t.book.toLowerCase().replace(/\s+/g, '')
  const range = t.verseEnd === t.verseStart ? `${t.verseStart}` : `${t.verseStart}-${t.verseEnd}`
  return `${book}/${t.chapter}/${range}`
}

/** "Matthew 5:10" or "Psalm 23:1-3", for labels. */
export function displayRef(t: Token) {
  const range = t.verseEnd === t.verseStart ? `${t.verseStart}` : `${t.verseStart}-${t.verseEnd}`
  return `${t.book} ${t.chapter}:${range}`
}

export const wordCount = (s: string) => (s.trim().match(/\S+/g) ?? []).length
export const WORD_LIMIT = 1000
// 1000 words is ~6k chars; this is the hard cap behind it.
export const MAX_BODY_CHARS = 20_000
