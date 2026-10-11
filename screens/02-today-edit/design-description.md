# Today edit

Editing state for the day's note. One textarea, 1000-word limit.

## Layout
- Top bar: hamburger · live word count "412 / 1000 words" (muted) centered · **Save** primary pill right.
- Date heading (same as view). No streak line while editing.
- Textarea fills the remaining height, same serif + line-height as reading mode so saved output looks like what was typed. No border, no box — the text sits directly on the page bg. Caret in accent color.
- Mobile: a thin toolbar above the keyboard with an "[ ] Insert verse" chip and hint text "Type a reference like [John 3:16]". The chip inserts `[]` and places the caret inside.
- Desktop: hint line at the bottom of the column: "Verses: type a reference in brackets — [John 3:16] — and it fills in when you save. Autosaves a draft every 30s; Save publishes the day."

## Verse token
- While editing, any `[Book Chapter:Verse]` (also ranges `[Psalm 23:1-3]`) is highlighted inline: bg `#2b2219`, text `#e8906f`, radius 4px, padding 1px 6px. The raw text stays editable.
- On Save, each token is resolved to reference + full verse text and rendered as a callout in the Today view. Store the raw text (with tokens) as source of truth; render callouts at display time.
- Unresolvable reference: leave the token visible with a muted style and show a small inline note "Couldn't find Matthew 99:1" — don't block saving.

## Behavior
- Save → persists, returns to Today view. Word count turns accent when > 1000 and Save disables.
- Autosave draft every 30s; the draft is not shown on the Today view until Save.
- Mobile: keyboard pushes content up; the Save button must remain reachable (top bar fixed).

## Shared visual system (same across all screens)

- Theme: dark by default. Warm near-black, not pure black.
- Colors: page bg `#141311`; sidebar/drawer bg `#111009`; raised surface (verse callout, chips) `#1c1a16` / `#1f1d18`; selected row `#1f1d18`; segmented-control active pill `#2e2b25`; hairline border `#24221d`; outline border `#3a372f`; text primary `#ece8df`; body text `#e4dfd4`; secondary `#b5afa3`; muted `#9b968b`; disabled/hint `#6f6a60`; future-day `#4a463f`; accent `#d97757`; accent hover `#e8906f`; text on accent `#1a120d`.
- Type: headings + note body in **Source Serif 4** (Georgia fallback). UI chrome (labels, buttons, counts) in system-ui.
  - Mobile: date heading 500 30px/1.2, letter-spacing -0.01em. Body 400 18px/1.65. Verse text italic 19px/1.6.
  - Desktop: date heading 500 40px/1.15, letter-spacing -0.015em. Body 400 19px/1.7, measure max 660px (incl. 40px side padding → ~580px text). Verse text italic 21px/1.6.
  - Small caps labels (TODAY, month names, verse reference): 500 12–13px, uppercase, letter-spacing .06–.1em.
- Spacing: mobile horizontal padding 24px; paragraph gap 18px (mobile) / 20px (desktop); top bar sits below status bar (66px top padding on mobile).
- Buttons: pill radius 999px, height 36px. Primary = accent fill, dark text. Secondary = 1px `#3a372f` outline, no fill. Tap targets ≥44px on mobile.
- Verse callout: full-bleed band on mobile (negative margin -24px, padding 22px 24px, bg `#1c1a16`); on desktop a 10px-radius block extending 32px past the text column. Reference label on top in accent small caps, verse text italic serif below. No left-border stripe.
- Streak: 6px accent dot + muted 13px text, e.g. "12 days in a row".
