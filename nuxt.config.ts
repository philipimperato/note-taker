// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
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
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#141311' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  // Production only: bundle server deps into the Nitro output. Nitro's traced node_modules uses
  // symlinks that break when a deploy is zipped on Windows. In dev, devtools deps can't be inlined.
  $production: { nitro: { noExternals: true } },
  // Day screens depend on the client's local date, so render them on the client only.
  routeRules: {
    // Security headers on every response, including the Nitro function (Netlify's own
    // header config only covers static files).
    '/**': {
      headers: {
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
      },
    },
    '/': { ssr: false },
    '/day/**': { ssr: false },
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    neonAuthBaseUrl: process.env.NEON_AUTH_BASE_URL,
  },
})
