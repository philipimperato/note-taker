# Data model

Derived from the screen specs in `screens/`. Kept deliberately small: two app tables, everything else derived or client-side. Identity comes from Neon Auth (see [auth-with-neon.md](./auth-with-neon.md)): users and sessions live in the `neon_auth` schema of the same Postgres database, so app tables reference `neon_auth.user.id` with a normal foreign key.

## What the screens need

- One note per calendar day. Raw text is the source of truth; verse tokens stay as `[Book C:V]` in the text.
- 1000-word limit. Word count is shown live and validated on Save (derived, not stored).
- Draft autosaved every 5s while the text changes; shown as "Unsaved changes" until Save or Discard; dropped after 24h without changes.
- "Saved 7:42 AM" timestamp on the Today view.
- Verse tokens resolved on Save to reference + full verse text; unresolvable tokens stay in the text with a hint. Callouts are rendered at display time.
- Notes list: every day with a saved note, newest first, grouped by month, with a first-line preview.
- Calendar: which days in a month have a note. Back-filling past days is allowed; future days are disabled.
- Streak: consecutive days with a saved note ending today. Derived, never stored.
- List | Calendar last choice: client preference (localStorage), not in the database.

## Entities

### note

One row per (user, date). Saved body and draft live on the same row.

| Column       | Type                 | Notes                                                                  |
|--------------|----------------------|------------------------------------------------------------------------|
| id           | uuid, pk             |                                                                        |
| user_id      | uuid, fk → neon_auth.user.id | Neon Auth user. Part of the unique key. `ON DELETE CASCADE`.      |
| note_date    | date                 | Local calendar day the note is for. Unique with `user_id`.             |
| body         | text, nullable       | Saved (published) raw text incl. tokens. NULL = never saved.           |
| draft_body   | text, nullable       | Autosaved draft. Set to NULL on Save or Discard. NULL = no pending draft. |
| draft_updated_at | timestamp, nullable | Last real change to the draft. Drafts untouched for 24h are dropped on read. |
| saved_at     | timestamp, nullable  | When `body` was last published. Drives "Saved 7:42 AM".                |
| created_at   | timestamp            |                                                                        |
| updated_at   | timestamp            | Bumped by autosave and Save.                                           |

Rules:

- Unique index on `(user_id, note_date)`.
- A day "has a note" (calendar dot, list row, streak) iff `body IS NOT NULL AND body <> ''`.
- A row with only `draft_body` set exists but is invisible in list, calendar, and streak.
- Word count and first-line preview are computed from `body` at read time. The 1000-word limit is validated on Save.
- `note_date` is a plain date with no timezone. The client decides "today" in the user's local zone and sends the date.

### verse

Lookup cache of resolved scripture text, keyed by normalized reference. Shared across users; filled the first time a reference is resolved on Save.

| Column       | Type       | Notes                                                                   |
|--------------|------------|-------------------------------------------------------------------------|
| reference    | string, pk | Normalized key, e.g. `john/3/16` or `psalm/23/1-3`.                     |
| book         | string     | Canonical book name ("John").                                           |
| chapter      | int        |                                                                         |
| verse_start  | int        |                                                                         |
| verse_end    | int        | Equals `verse_start` for a single verse.                                |
| text         | text       | Full verse text as rendered in the callout.                             |
| translation  | string     | e.g. "KJV". One translation for now; column kept so it can vary later.  |
| fetched_at   | timestamp  |                                                                         |

Rules:

- On Save, parse tokens from `body`, normalize each, resolve any not already cached via the scripture source, and insert the ones found.
- Unresolvable references are not inserted. At render time a token with no matching `verse` row renders muted with the "Couldn't find …" hint. No failed-lookup table.
- No join table between `note` and `verse`. The note's `body` already lists its tokens; rendering looks them up by key.

## Not stored

- **Streak**: fetch `note_date` for the user where `body IS NOT NULL AND note_date <= today`, ordered descending, and count consecutive days from today. Show "Start a new streak" when yesterday is missing and today is empty.
- **Word count / preview**: derived from `body`.
- **List vs Calendar preference**: localStorage on the client.
- **User**: deferred. `user_id` becomes a foreign key once the identity server is chosen.

## Core queries by screen

| Screen / action   | Query                                                                                           |
|-------------------|-------------------------------------------------------------------------------------------------|
| Today view        | `note` where `user_id` and `note_date = today` → `body`, `saved_at`                             |
| Today edit        | Same row → `draft_body ?? body ?? ''`                                                           |
| Autosave          | Upsert row; set `draft_body`, `updated_at`                                                      |
| Save              | Validate ≤ 1000 words; resolve verses; set `body = draft`, `draft_body = NULL`, `saved_at = now()` |
| Notes list        | Where `user_id` and `body IS NOT NULL` order by `note_date DESC` → date + first line            |
| Calendar month    | Where `user_id` and `body IS NOT NULL` and `note_date` between first and last of month → dates  |
| Render callouts   | Parse tokens in `body`; `SELECT * FROM verse WHERE reference IN (...)`                          |

## Next steps

- Turn this into a Prisma/Drizzle/SQL schema once the stack is chosen.
- Enable Neon Auth on each branch (dev / preview / prod) before running migrations, since the `note.user_id` foreign key targets `neon_auth.user`.
