import { defineConfig } from 'drizzle-kit'
import { existsSync } from 'node:fs'

// `neon link` / `neon deploy` write .env.local; drizzle-kit only reads .env on its own.
if (existsSync('.env.local')) process.loadEnvFile('.env.local')

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL! },
  schemaFilter: ['public'], // never let drizzle-kit touch the neon_auth schema
})
