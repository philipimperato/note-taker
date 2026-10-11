import { DEFAULT_AUTH_SKIP_ROUTES, processAuthMiddleware } from '@neondatabase/auth/server'

const SKIP_ROUTES = [...DEFAULT_AUTH_SKIP_ROUTES, '/auth']
const LOGIN_URL = '/auth/sign-in'

const isAsset = (path: string) =>
  path.startsWith('/_nuxt') || path.startsWith('/__nuxt') || path.startsWith('/_fonts') || /\.[a-z0-9]+$/i.test(path)

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname

  // API: attach the user (routes call requireUser). The auth proxy handles itself.
  if (path.startsWith('/api/')) {
    if (!path.startsWith('/api/auth')) event.context.user = await getSessionUser(event)
    return
  }
  if (isAsset(path)) return

  // Pages: the SDK's middleware exchanges the OAuth return token for a session (Google etc.),
  // refreshes cached session cookies, and decides whether the route needs a login.
  const { baseUrl, cookieSecret } = authConfig()
  const result = await processAuthMiddleware({
    request: toWebRequest(event),
    pathname: path,
    skipRoutes: SKIP_ROUTES,
    loginUrl: LOGIN_URL,
    baseUrl,
    cookieSecret,
    sameSite: 'lax',
  })

  for (const c of result.cookies ?? []) appendResponseHeader(event, 'set-cookie', c)

  if (result.action === 'redirect_oauth' || result.action === 'redirect_login') {
    return sendRedirect(event, result.redirectUrl.toString(), 302)
  }
})
