# Today view (saved / reading)

Default screen when the app opens. Shows today's saved note in reading mode.

## Layout
- Top bar: hamburger (opens Notes menu) · "TODAY" small-caps label centered · **Edit** secondary pill button right. Desktop adds "Saved 7:42 AM" muted text left of Edit.
- Date heading: full weekday + month + day ("Saturday, October 11"). Below it the streak line.
- Note body: paragraphs rendered from the saved text. Blank lines split paragraphs.
- Verse callouts render inline exactly where the `[Book C:V]` token was typed (see Today edit for the parse rule).
- Desktop: sidebar is collapsed (hamburger only); content is a centered single column, max-width 660px.

## Behavior
- Edit → switches to Today edit with the raw text (tokens shown as `[Matthew 5:10]`, not expanded).
- Read-only; no inline editing of rendered text.
- Past days open in this same view via the Notes menu; the top label becomes the short date instead of "TODAY".
- Scroll is the page; the top bar can stay fixed or scroll away (either is fine).

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
