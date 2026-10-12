const PUBLIC_PREFIX = '/auth'
const ENTRY_PAGES = new Set(['/auth/sign-in', '/auth/sign-up'])

const VERIFIER_PARAM = 'neon_auth_session_verifier'

export default defineNuxtRouteMiddleware(async (to) => {
  // The server exchanges this one-shot token for cookies; it should never stay in the URL.
  if (VERIFIER_PARAM in to.query) {
    const { [VERIFIER_PARAM]: _drop, ...query } = to.query
    return navigateTo({ path: to.path, query }, { replace: true })
  }

  const { user, pending, refresh } = useAuthSession()
  if (pending.value) await refresh()

  const isPublic = to.path.startsWith(PUBLIC_PREFIX)
  if (!user.value && !isPublic) return navigateTo('/auth/sign-in')
  if (user.value && ENTRY_PAGES.has(to.path)) return navigateTo('/')
})
