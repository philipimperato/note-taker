// Verse token parsing shared by the server (resolve + cache) and the client (highlight + render).

// Matches [John 3:16], [1 John 3:16], [Song of Songs 2:1], [Psalm 23:1-3]
export const VERSE_TOKEN = /\[([1-3]?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)\s+(\d+):(\d+)(?:-(\d+))?\]/g

export type Token = {
  raw: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number
}

export function parseTokens(body: string): Token[] {
  return [...body.matchAll(VERSE_TOKEN)].map((m) => ({
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

/** "Matthew 5:10" or "Psalm 23:1-3", for labels. */
export function displayRef(t: Token) {
  const range = t.verseEnd === t.verseStart ? `${t.verseStart}` : `${t.verseStart}-${t.verseEnd}`
  return `${t.book} ${t.chapter}:${range}`
}

export const wordCount = (s: string) => (s.trim().match(/\S+/g) ?? []).length
export const WORD_LIMIT = 1000
