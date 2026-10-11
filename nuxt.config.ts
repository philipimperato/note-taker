// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  ui: {
    prefix: '',   // <Button>, <Textarea>, <Tabs>… instead of <UButton>
  },
  colorMode: { preference: 'dark', fallback: 'dark', classSuffix: '' },
  fonts: {
    families: [
      { name: 'Source Serif 4', provider: 'google', weights: [400, 500, 600], styles: ['normal', 'italic'] },
    ],
  },
  app: {
    head: {
      title: 'NoteTaker',
      htmlAttrs: { class: 'dark', style: 'color-scheme: dark' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }],
    },
  },
  // Day screens depend on the client's local date, so render them on the client only.
  routeRules: {
    '/': { ssr: false },
    '/day/**': { ssr: false },
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    neonAuthBaseUrl: process.env.NEON_AUTH_BASE_URL,
  },
})
