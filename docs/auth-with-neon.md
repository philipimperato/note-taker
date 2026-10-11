# Auth with Neon (Managed Better Auth) — Nitro / Nuxt

Reference for adding authentication to a Nitro or Nuxt 4 app using Neon Auth.
Neon hosts a Better Auth server; users and sessions live in the `neon_auth` schema of the app's own Neon Postgres database.

Status: Neon Auth is labeled beta and is AWS-regions-only. Verify current SDK signatures before relying on identifiers below.

## Architecture

```
Browser (authClient)
   │  /api/auth/*  (first-party cookies)
   ▼
Nitro app — catch-all proxy route + session middleware
   │  forwards to NEON_AUTH_BASE_URL
   ▼
Neon Auth (hosted Better Auth)
   │  writes users / sessions
   ▼
Neon Postgres — neon_auth schema + app tables (same DB, FKs and joins work)
```

Key decision: the browser never talks to Neon directly. The app proxies every auth route so cookies stay first-party.

## Setup

1. Neon Console → project → Auth → enable on the branch. Managed Auth is configured per branch (dev / preview / prod each need their own config).
2. Copy the Auth URL from Auth → Configuration.
3. Install the SDK:

```powershell
pnpm add @neondatabase/auth
```

4. Environment:

```ini
NEON_AUTH_BASE_URL=https://ep-xxx.neonauth.us-east-2.aws.neon.build/neondb/auth
DATABASE_URL=postgresql://...
```

## Server (Nitro)

File paths below are for Nuxt (`server/...`). For standalone Nitro use `routes/api/auth/[...all].ts` and `middleware/session.ts` — same code.

```ts
// server/utils/auth.ts
import { createNeonAuth } from '@neondatabase/auth/server'

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
})
```

```ts
// server/api/auth/[...all].ts
export default defineEventHandler((event) => auth.handler(toWebRequest(event)))
```

```ts
// server/middleware/session.ts
export default defineEventHandler(async (event) => {
  const session = await auth.getSession(toWebRequest(event))
  event.context.user = session?.user ?? null
})
```

`toWebRequest(event)` converts the H3 event to a standard `Request`; returning the handler's `Response` lets Nitro stream it back with Set-Cookie headers intact.

### Protecting routes

```ts
// server/api/accounts.get.ts
export default defineEventHandler(async (event) => {
  if (!event.context.user) throw createError({ statusCode: 401 })
  return db.selectFrom('accounts')
    .where('owner_id', '=', event.context.user.id)
    .execute()
})
```

## Client

```ts
// app/utils/auth-client.ts
import { createAuthClient } from '@neondatabase/auth/client'
export const authClient = createAuthClient({ baseURL: '/api/auth' })
```

```ts
await authClient.signUp.email({ email, password, name })
await authClient.signIn.email({ email, password })
const { data: session } = await authClient.useSession()
await authClient.signOut()
```

## Credential model

- Email + password is the core method (`signIn.email`, `signUp.email`). Username login is a Better Auth plugin; on the managed path plugins are enabled through the Neon Console, not passed into the SDK — check what the branch offers.
- OAuth (Google, GitHub, etc.): paste provider app credentials into the branch's Auth config for production. Callback URLs must use a trusted domain.

## Email verification and password reset

Both are built in; Neon sends the emails (no SMTP to configure). Both use 6-digit one-time codes, not magic links — UI needs an OTP input.

```ts
// verification (after sign-up)
await authClient.emailOtp.verifyEmail({ email, otp })

// password reset
await authClient.forgetPassword.emailOtp({ email })
await authClient.emailOtp.resetPassword({ email, otp, password })
```

Whether verification is required before login is a toggle in the branch Auth config. Email template branding is limited on the managed tier.

## Joining auth users to app data

Reference `neon_auth.user.id` from app tables with a normal foreign key. No sync job is needed because auth and app data share the database.

## Pricing

Included in all Neon plans, metered by MAU (a unique user who authenticates at least once in a billing month):

| Plan   | Auth MAU   | Compute          |
|--------|------------|------------------|
| Free   | 60k        | 100 CU-hours/project |
| Launch | 1M         | $0.106/CU-hour   |
| Scale  | 1M         | $0.222/CU-hour   |

No separate auth charge; cost is just database usage.

## Verify before copying

Exact export names (`createNeonAuth`, `createAuthClient`, the `/server` and `/client` subpaths, the `emailOtp` method names) are from early docs and the SDK is moving fast. Check the package README and the docs links below first.

## Sources

- https://neon.com/docs/auth/overview
- https://neon.com/docs/auth/migrate/from-legacy-auth
- https://neon.com/docs/ai/skills/neon-auth/SKILL.md
- https://neon.com/docs/auth/guides/setup-oauth
- https://neon.com/docs/auth/guides/email-verification
- https://neon.com/docs/auth/guides/password-reset
- https://neon.com/pricing
- https://github.com/neondatabase/neon-js/tree/main/packages/auth
