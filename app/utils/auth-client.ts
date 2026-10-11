import { createAuthClient } from '@neondatabase/auth'

// Talks to the same-origin proxy in server/api/auth/[...].ts, so cookies stay first-party.
export const authClient = createAuthClient('/api/auth')
