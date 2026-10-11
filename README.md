# NoteTaker

One note a day, with scripture verses inline. Nuxt 4 + Nuxt UI + Drizzle on Neon Postgres, auth via Neon Auth.

## Setup

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL and NEON_AUTH_BASE_URL
pnpm db:migrate
pnpm dev
```

## Docs

- [Screen specs](screens/)
- [Data model](docs/data-model.md)
- [Drizzle + Nuxt setup](docs/drizzle-setup.md)
- [Auth with Neon](docs/auth-with-neon.md)
- [Nuxt UI theme](nuxt-ui-theme/README.md) (copied into `app/app.config.ts` and `app/assets/css/main.css`)
