# Notes list

The menu. Opened from the hamburger; lists every day that has a note, newest first.

## Layout
- Mobile: full-screen sheet. Top bar: close X left · List | Calendar segmented control centered. Heading "Notes". Rows grouped under month small-caps labels ("OCTOBER", "SEPTEMBER").
  - Row: day number (serif 18px) left in a 34px column · weekday (12px muted) · 2-line clamped preview of the note's first line (serif 15px, `#b5afa3`). Hairline `#24221d` between rows, 14px vertical padding.
- Desktop: persistent left sidebar 272px, bg `#111009`, hairline right border. Header "Notes" + small segmented control. **Today** accent button (40px, radius 8). Then month labels and compact rows: day number (serif 15px) + single-line ellipsized preview (13px). Selected row bg `#1f1d18`, radius 8. Streak line pinned at sidebar bottom. The main pane shows the selected day in reading mode.

## Behavior
- Tap row → open that day in Today view (reading). Mobile closes the sheet.
- Today button → jump to today.
- List | Calendar toggles the same panel between this view and Notes calendar; remember the last choice.
- Days with no note are not listed (calendar covers gaps).
- Empty state (no notes yet): "No notes yet. Today is a good day to start." + Today button.

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
