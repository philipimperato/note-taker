import type { RequireSessionData } from '@neondatabase/auth/server'

declare module 'h3' {
  interface H3EventContext {
    /** Populated by server/middleware/session.ts for /api/* requests. */
    user: RequireSessionData['user'] | null
  }
}

export {}
