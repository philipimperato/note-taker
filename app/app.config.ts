// app.config.ts — Nuxt UI v3 component theme for Daily Notes
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'ember',
      neutral: 'ink',
    },

    button: {
      slots: {
        base: 'rounded-full font-medium transition-colors cursor-pointer',
      },
      variants: {
        size: {
          md: { base: 'h-9 px-4 text-sm gap-2' },          // 36px pill (Edit / Save)
          lg: { base: 'h-11 px-6 text-[15px] gap-2' },     // 44px (desktop "Start today's note")
          xl: { base: 'h-13 px-7 text-base gap-2' },       // 52px full-width mobile CTA
        },
      },
      compoundVariants: [
        // Primary solid: ember fill, dark text (no white text on orange)
        { color: 'primary', variant: 'solid',
          class: 'bg-primary text-[#1a120d] hover:bg-primary-400 active:bg-primary-600 disabled:bg-primary/40' },
        // Secondary = primary, outlined. Full-opacity ring, primary text, subtle fill on hover.
        { color: 'primary', variant: 'outline',
          class: 'bg-transparent text-primary ring ring-inset ring-primary hover:bg-primary/10 active:bg-primary/15 disabled:ring-primary/40 disabled:text-primary/40' },
        // Ghost: used for icon buttons (hamburger, close, ‹ ›)
        { color: 'neutral', variant: 'ghost',
          class: 'text-highlighted hover:bg-accented' },
        { color: 'neutral', variant: 'outline',
          class: 'text-highlighted ring ring-inset ring-accented hover:bg-accented' },
      ],
      defaultVariants: { color: 'primary', variant: 'solid', size: 'md' },
    },

    // The note editor: no box, no ring — text sits on the page.
    textarea: {
      slots: {
        base: 'font-serif text-lg leading-[1.65] lg:text-[19px] lg:leading-[1.7] bg-transparent text-default placeholder:italic placeholder:text-dimmed caret-primary resize-none p-0 focus-visible:ring-0',
      },
      defaultVariants: { variant: 'none', size: 'xl' },
    },

    // List | Calendar toggle
    tabs: {
      slots: {
        list: 'bg-accented rounded-full p-[3px]',
        indicator: 'rounded-full bg-[#2e2b25] shadow-none',
        trigger: 'rounded-full h-[30px] px-4 text-[13px] font-medium text-muted data-[state=active]:text-highlighted',
      },
      defaultVariants: { color: 'neutral', variant: 'pill', size: 'sm' },
    },

    // Mobile menu sheet / desktop sidebar
    slideover: {
      slots: { content: 'bg-muted', overlay: 'bg-black/60' },
    },

    // Notes rows and calendar cells
    badge: { defaultVariants: { color: 'primary', variant: 'soft' } },
    separator: { slots: { border: 'border-default' } },
    tooltip: { slots: { content: 'bg-elevated text-highlighted ring-default' } },
    kbd: { slots: { base: 'bg-accented text-primary ring-0 font-mono' } },
  },
})
