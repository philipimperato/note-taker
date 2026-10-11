import { createAuthServer, extractNeonAuthCookies, type RequestContext } from '@neondatabase/auth/server'
import type { H3Event } from 'h3'

export function authConfig() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET
  if (!baseUrl) throw new Error('NEON_AUTH_BASE_URL is not set')
  if (!cookieSecret || cookieSecret.length < 32) throw new Error('NEON_AUTH_COOKIE_SECRET must be at least 32 characters')
  return { baseUrl, cookieSecret }
}

/** Bridges the SDK's framework-agnostic RequestContext to an H3 event. */
function h3RequestContext(event: H3Event): RequestContext {
  return {
    getCookies: () => extractNeonAuthCookies(getHeader(event, 'cookie') ?? ''),
    setCookie: (name, value, options) => setCookie(event, name, value, options),
    getHeader: (name) => getHeader(event, name) ?? null,
    getOrigin: () => getHeader(event, 'origin') ?? getRequestURL(event).origin,
    getFramework: () => 'nuxt',
  }
}

/** Per-request Neon Auth server. Cheap to build; the SDK does the work lazily. */
export function authServer(event: H3Event) {
  const { baseUrl, cookieSecret } = authConfig()
  return createAuthServer({ baseUrl, cookieSecret, context: () => h3RequestContext(event) })
}

export async function getSessionUser(event: H3Event) {
  const { data } = await authServer(event).getSession()
  return data?.user ?? null
}

export function requireUser(event: H3Event) {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return user
}
