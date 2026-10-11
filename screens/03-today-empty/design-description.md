# Today view — empty

The Today view when nothing has been written for the day yet.

## Layout
- Top bar: hamburger · "TODAY" · no Edit button (nothing to edit).
- Date heading + streak line, with encouragement appended: "12 days in a row — keep it going".
- Placeholder copy in italic serif, hint color `#6f6a60`: "Start writing. Nothing is saved until you tap Save. Drop in a verse by typing its reference in brackets, like [Psalm 23:1]." (Desktop says "click Save".)
- Primary CTA **Start today's note**: mobile — full-width 52px pill pinned near the bottom; desktop — inline 44px pill under the placeholder.

## Behavior
- CTA (or tapping anywhere in the placeholder area) → Today edit with focus in the textarea.
- If yesterday had no note, the streak line reads "Start a new streak" instead.
- Language is "note", never "prayer" or "journal".

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
