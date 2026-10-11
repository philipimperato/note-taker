import { handleAuthProxyRequest } from '@neondatabase/auth/server'

// Proxies every /api/auth/* call to Neon Auth so cookies stay first-party.
export default defineEventHandler((event) => {
  const { baseUrl, cookieSecret } = authConfig()
  const path = getRequestURL(event).pathname.replace(/^\/api\/auth\/?/, '')
  return handleAuthProxyRequest({ request: toWebRequest(event), path, baseUrl, cookieSecret, sameSite: 'lax' })
})
