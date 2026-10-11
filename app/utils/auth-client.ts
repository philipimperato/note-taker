import { createAuthClient } from '@neondatabase/auth'
import type { BetterAuthVanillaAdapterInstance } from '@neondatabase/auth/vanilla'

type AuthClient = ReturnType<typeof createAuthClient<BetterAuthVanillaAdapterInstance>>

// The SDK wants an absolute URL and is only ever called from event handlers in the browser,
// so build it lazily from the page origin. Session reads during SSR go through useAuthSession.
let instance: AuthClient | undefined
function client(): AuthClient {
  if (import.meta.server) throw new Error('authClient is browser-only; use useAuthSession() on the server')
  instance ??= createAuthClient(`${window.location.origin}/api/auth`) as AuthClient
  return instance
}

// Talks to the same-origin proxy in server/api/auth/[...].ts, so cookies stay first-party.
export const authClient = new Proxy({} as AuthClient, {
  get: (_target, key) => Reflect.get(client(), key),
})

type AuthResult<T> = { ok: true; data: T } | { ok: false; message: string }

/**
 * The SDK sometimes returns `{ error }` and sometimes throws (AuthApiError) on HTTP failures.
 * Normalize both so pages can `if (!r.ok) error.value = r.message`.
 */
export async function authCall<T>(
  fn: () => Promise<{ data?: T | null; error?: { message?: string } | null }>,
  fallback: string,
): Promise<AuthResult<T>> {
  try {
    const { data, error } = await fn()
    if (error) return { ok: false, message: error.message || fallback }
    return { ok: true, data: data as T }
  } catch (e) {
    const message = e instanceof Error && e.message ? e.message : fallback
    return { ok: false, message }
  }
}
