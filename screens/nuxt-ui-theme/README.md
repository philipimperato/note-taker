# Nuxt UI theme — Daily Notes

Drop-in theme for Nuxt UI v3. Two files:

- `assets/css/main.css` — color scales (`ember` primary, `ink` neutral), semantic token mapping for dark mode, fonts, and reading utilities (`prose-note`, `heading-date`, `label-caps`, `verse-callout`, `verse-token`).
- `app.config.ts` — component overrides. Secondary buttons are **primary outlined** (`variant="outline"`), pills by default.

## nuxt.config.ts

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  colorMode: { preference: 'dark', fallback: 'dark', classSuffix: '' },
  fonts: { families: [{ name: 'Source Serif 4', provider: 'google', weights: [400, 500, 600], styles: ['normal', 'italic'] }] },
})
```

## Usage map (mockup → Nuxt UI)

- Save / Start today's note → `<UButton>Save</UButton>` (solid primary, dark text)
- Edit → `<UButton variant="outline">Edit</UButton>`
- Hamburger / close / ‹ › → `<UButton color="neutral" variant="ghost" icon="i-lucide-menu" />` (icon-only is 44px: add `class="size-11"`)
- Note editor → `<UTextarea v-model="text" autoresize :maxrows="0" placeholder="Start writing…" />`
- Rendered note → `<div class="prose-note">…<div class="verse-callout"><div class="ref">Matthew 5:10</div><div class="text">…</div></div>…</div>`
- Date heading → `<h1 class="heading-date">Saturday, October 11</h1>`; TODAY → `<span class="label-caps">Today</span>`
- List | Calendar → `<UTabs :items="[{label:'List'},{label:'Calendar'}]" />`
- Mobile menu → `<USlideover side="left">`; desktop sidebar is a plain `<aside class="w-[272px] bg-muted border-r border-default">`
- Calendar → `<UCalendar>` with a day slot: 5px `bg-primary` dot under days with a note; today = `bg-primary text-[#1a120d]`
- Word count → `<span class="text-sm text-muted">412 / 1000 words</span>`, swap to `text-primary` when over.
