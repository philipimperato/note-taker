const PUBLIC_PREFIX = '/auth'
const ENTRY_PAGES = new Set(['/auth/sign-in', '/auth/sign-up'])

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, pending, refresh } = useAuthSession()
  if (pending.value) await refresh()

  const isPublic = to.path.startsWith(PUBLIC_PREFIX)
  if (!user.value && !isPublic) return navigateTo('/auth/sign-in')
  if (user.value && ENTRY_PAGES.has(to.path)) return navigateTo('/')
})
