# Drizzle + Nuxt setup (Neon Postgres + Neon Auth)

Implements [data-model.md](./data-model.md) with Drizzle ORM inside Nuxt's Nitro server, on Neon Postgres. Authentication is Neon Auth, as described in [auth-with-neon.md](./auth-with-neon.md); this doc only covers the pieces where Drizzle and auth meet.

## 1. Install

```bash
pnpm add drizzle-orm @neondatabase/serverless @neondatabase/auth
```

```bash
pnpm add -D drizzle-kit
```

## 2. Environment

`neon link` writes `.env.local` with `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `NEON_AUTH_BASE_URL`, and `NEON_AUTH_JWKS_URL`. Add `NEON_AUTH_COOKIE_SECRET` yourself (see `.env.example`). It is git-ignored. The `dev` script loads it with `--dotenv .env.local`, and `drizzle.config.ts` loads it with `process.loadEnvFile` so the `db:*` scripts see the same values. Re-run `neon deploy` to refresh it.

Neon Auth is configured per branch (`auth: true` in `neon.ts`). Enable it on the branch before running migrations, because `note.user_id` has a foreign key to `neon_auth.user`.

## 3. Files to create

```
server/
  db/
    auth-schema.ts         # neon_auth.user, for typed joins only (not migrated by drizzle-kit)
    schema.ts              # app tables
    index.ts               # db client (Nitro-side only)
  utils/
    auth.ts                # createAuthServer (H3 context) + requireUser helper
    notes.ts               # queries used by the API routes
    verses.ts              # token parsing + verse lookup
  middleware/
    session.ts             # puts the Neon Auth user on event.context
  api/
    auth/[...all].ts       # proxy to Neon Auth
    notes/[date]/index.get.ts
    notes/[date]/index.put.ts
    notes/[date]/draft.put.ts
    notes/index.get.ts
    notes/month/[ym].get.ts
    streak.get.ts
app/utils/auth-client.ts
drizzle/                   # generated migrations (commit these)
drizzle.config.ts
```

## 4. drizzle.config.ts

```ts
import { defineConfig } from 'drizzle-kit'
import { existsSync } from 'node:fs'

// `neon link` / `neon deploy` write .env.local; drizzle-kit only reads .env on its own.
if (existsSync('.env.local')) process.loadEnvFile('.env.local')

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL! },
  schemaFilter: ['public'],   // never let drizzle-kit touch the neon_auth schema
})
```

## 5. server/db/auth-schema.ts and server/db/schema.ts

Neon Auth owns and migrates the `neon_auth` schema. drizzle-kit's `schemaFilter` only limits introspection, not generation, so any table it can see in the schema file gets a `CREATE TABLE`. The auth table therefore lives in its own file, outside the `schema` glob in `drizzle.config.ts`, and is imported only by app code that needs typed joins.

```ts
// server/db/auth-schema.ts  (not in drizzle.config.ts)
import { pgSchema, uuid, text } from 'drizzle-orm/pg-core'

export const neonAuth = pgSchema('neon_auth')
export const authUsers = neonAuth.table('user', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
})
```

```ts
// server/db/schema.ts
import { pgTable, text, integer, date, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core'

export const notes = pgTable(
  'note',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // FK to neon_auth.user(id) ON DELETE CASCADE is declared in drizzle/0000_init.sql,
    // not here, so drizzle-kit never touches the Neon-owned schema.
    userId: uuid('user_id').notNull(),
    noteDate: date('note_date', { mode: 'string' }).notNull(),   // 'YYYY-MM-DD', local calendar day
    body: text('body'),                                          // saved raw text incl. [Book C:V] tokens; NULL = never saved
    draftBody: text('draft_body'),                               // autosave; NULL = no pending draft
    savedAt: timestamp('saved_at', { withTimezone: true }),      // last Save
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('note_user_date_uq').on(t.userId, t.noteDate)],
)

export const verses = pgTable('verse', {
  reference: text('reference').primaryKey(),   // normalized, e.g. 'john/3/16', 'psalm/23/1-3'
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
```

The foreign key is appended by hand to the first migration, after the generated statements:

```sql
--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade;
```

`neon_auth.user.id` is a `uuid` on this project (verified against the production branch). drizzle-kit does not know about this FK, which is fine for `generate` and `migrate`; avoid `drizzle-kit push`, which would try to drop it.

## 6. server/db/index.ts

```ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

`neon-http` is the right driver for serverless and edge deploys. If you run a long-lived Node server and want transactions, switch to `drizzle-orm/neon-serverless` with `Pool`. Only import `db` from `server/` code.

## 7. Migrations

```bash
pnpm drizzle-kit generate
```

```bash
pnpm drizzle-kit migrate
```

`package.json` scripts:

```json
"scripts": {
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

Run `db:migrate` against each Neon branch (dev, preview, prod) after Neon Auth is enabled on that branch. The first migration (`drizzle/0000_init.sql`) has already been applied to `production`. Avoid `drizzle-kit push`; it does not know about the hand-written FK.

## 8. Auth glue

The SDK's `createNeonAuth` is Next.js-only (`@neondatabase/auth/next/server`). For Nuxt we use the framework-agnostic toolkit from `@neondatabase/auth/server`: `handleAuthProxyRequest` for the proxy route and `createAuthServer` with an H3-backed `RequestContext` for sessions. Both need `NEON_AUTH_COOKIE_SECRET` (32+ chars, app-generated, in `.env.local`) to sign the cached session cookie.

```ts
// server/utils/auth.ts
import { createAuthServer, extractNeonAuthCookies, type RequestContext } from '@neondatabase/auth/server'
import type { H3Event } from 'h3'

export function authConfig() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET
  if (!baseUrl) throw new Error('NEON_AUTH_BASE_URL is not set')
  if (!cookieSecret || cookieSecret.length < 32) throw new Error('NEON_AUTH_COOKIE_SECRET must be at least 32 characters')
  return { baseUrl, cookieSecret }
}

function h3RequestContext(event: H3Event): RequestContext {
  return {
    getCookies: () => extractNeonAuthCookies(getHeader(event, 'cookie') ?? ''),
    setCookie: (name, value, options) => setCookie(event, name, value, options),
    getHeader: (name) => getHeader(event, name) ?? null,
    getOrigin: () => getHeader(event, 'origin') ?? getRequestURL(event).origin,
    getFramework: () => 'nuxt',
  }
}

export function authServer(event: H3Event) {
  const { baseUrl, cookieSecret } = authConfig()
  return createAuthServer({ baseUrl, cookieSecret, context: () => h3RequestContext(event) })
}

export async function getSessionUser(event: H3Event) {
  const { data } = await authServer(event).getSession()
  return data?.user ?? null
}

export function requireUser(event: H3Event) {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return user
}
```

```ts
// server/middleware/session.ts  — only runs for /api/*, skips /api/auth
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/') || path.startsWith('/api/auth')) return
  event.context.user = await getSessionUser(event)
})
```

```ts
// server/api/auth/[...].ts  — first-party proxy to Neon Auth
import { handleAuthProxyRequest } from '@neondatabase/auth/server'

export default defineEventHandler((event) => {
  const { baseUrl, cookieSecret } = authConfig()
  const path = getRequestURL(event).pathname.replace(/^\/api\/auth\/?/, '')
  return handleAuthProxyRequest({ request: toWebRequest(event), path, baseUrl, cookieSecret, sameSite: 'lax' })
})
```

```ts
// app/utils/auth-client.ts
import { createAuthClient } from '@neondatabase/auth'
export const authClient = createAuthClient('/api/auth')
```

```ts
// server/types.d.ts  — types event.context.user
import type { RequireSessionData } from '@neondatabase/auth/server'
declare module 'h3' {
  interface H3EventContext { user: RequireSessionData['user'] | null }
}
export {}
```

Client calls (`signUp.email`, `signIn.email`, `getSession`, `signOut`, `emailOtp.*`) are in [auth-with-neon.md](./auth-with-neon.md) and need no Drizzle code. Verified: with no cookie, `GET /api/auth/get-session` proxies to Neon and returns `null`; note routes return 401.

## 9. Queries (server/utils/notes.ts)

Nitro auto-imports anything exported from `server/utils/`.

```ts
import { and, eq, isNotNull, ne, lte, desc, between } from 'drizzle-orm'
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

// Notes list: every saved day, newest first. Preview is derived in the handler.
export function listSavedNotes(userId: string) {
  return db
    .select({ noteDate: notes.noteDate, body: notes.body })
    .from(notes)
    .where(and(eq(notes.userId, userId), hasSavedBody))
    .orderBy(desc(notes.noteDate))
}

// Calendar: which days in a month have a saved note. ym is 'YYYY-MM'.
export async function savedDatesInMonth(userId: string, ym: string) {
  const rows = await db
    .select({ noteDate: notes.noteDate })
    .from(notes)
    .where(and(eq(notes.userId, userId), hasSavedBody, between(notes.noteDate, `${ym}-01`, `${ym}-31`)))
  return rows.map((r) => r.noteDate)
}

// Streak: consecutive saved days ending today, or ending yesterday if today is still empty.
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

export const wordCount = (s: string) => (s.trim().match(/\S+/g) ?? []).length
```

## 10. Verses (server/utils/verses.ts)

```ts
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
    book: m[1].trim(),
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

// Implement against the chosen scripture API. Return null when the reference does not exist.
async function lookupVerse(_t: Token): Promise<{ book: string; chapter: number; verseStart: number; verseEnd: number; text: string } | null> {
  throw new Error('lookupVerse not implemented')
}

// Called on Save. Resolves uncached references and stores the hits.
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

// Called at render time. The client expands tokens into callouts from this map.
export async function versesFor(body: string) {
  const refs = [...new Set(parseTokens(body).map(normalizeRef))]
  if (!refs.length) return {}
  const rows = await db.select().from(verses).where(inArray(verses.reference, refs))
  return Object.fromEntries(rows.map((v) => [v.reference, v]))
}
```

`lookupVerse` is the one piece left open. A token whose normalized key is missing from the `versesFor` map is what the client renders as the muted "Couldn't find …" hint.

## 11. API routes

Every note route starts with `requireUser(event)`. The session middleware has already populated `event.context.user` from the Neon Auth cookie.

```ts
// server/api/notes/[date]/index.get.ts
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const date = getRouterParam(event, 'date')!
  const note = await getNote(user.id, date)
  return { note: note ?? null, verses: note?.body ? await versesFor(note.body) : {} }
})
```

```ts
// server/api/notes/[date]/index.put.ts  (Save)
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const date = getRouterParam(event, 'date')!
  const { body, today } = await readBody<{ body: string; today: string }>(event)
  if (wordCount(body) > 1000) throw createError({ statusCode: 422, statusMessage: 'Over 1000 words' })
  if (date > today) throw createError({ statusCode: 422, statusMessage: 'Future date' })
  await cacheVerses(body)
  await publishNote(user.id, date, body)
  return { ok: true }
})
```

```ts
// server/api/notes/[date]/draft.put.ts  (autosave)
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const date = getRouterParam(event, 'date')!
  const { body } = await readBody<{ body: string }>(event)
  await saveDraft(user.id, date, body)
  return { ok: true }
})
```

```ts
// server/api/notes/index.get.ts  (list)
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const rows = await listSavedNotes(user.id)
  return rows.map((r) => ({ date: r.noteDate, preview: r.body!.split('\n').find(Boolean) ?? '' }))
})
```

```ts
// server/api/notes/month/[ym].get.ts  (calendar)
export default defineEventHandler((event) =>
  savedDatesInMonth(requireUser(event).id, getRouterParam(event, 'ym')!),
)
```

```ts
// server/api/streak.get.ts
export default defineEventHandler((event) => {
  const today = getQuery(event).today as string
  return streak(requireUser(event).id, today)
})
```

The client always sends its local `YYYY-MM-DD` as `today`. The server never computes the current date itself, so the calendar day matches what the user sees.

## 12. Client notes

- Gate the app pages with a route middleware that checks `authClient.useSession()` and redirects to the sign-in page when there is no session. The sign-in, sign-up, and OTP screens are not in `screens/` yet.
- Today view: `useFetch('/api/notes/' + today)` then render `note.body`, replacing each token with a callout from `verses[normalizeRef(token)]`. Move `parseTokens` and `normalizeRef` into `shared/` if you want to reuse them client-side.
- Today edit: open with `note.draftBody ?? note.body ?? ''`. Autosave with `$fetch(..., { method: 'PUT' })` to the draft route every 30s while dirty.
- List | Calendar choice: `localStorage`, not the API.

## 13. Status

Everything in sections 5 through 11 is implemented and type-checks against `@neondatabase/auth@0.5.0-beta`. Still open: `lookupVerse` (returns `null` until a scripture API is chosen), the sign-in / sign-up / OTP pages, and a route middleware that redirects signed-out users.
