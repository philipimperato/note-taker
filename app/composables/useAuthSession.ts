export type SessionUser = {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image?: string | null
}

type SessionPayload = { user: SessionUser; session: { expiresAt: string } } | null

/**
 * Current session, fetched through the same-origin auth proxy so it works during SSR
 * (cookies forwarded) and on the client. Call `refresh()` after sign-in/out.
 */
export function useAuthSession() {
  const headers = useRequestHeaders(['cookie'])
  const { data, pending, refresh } = useFetch<SessionPayload>('/api/auth/get-session', {
    key: 'auth-session',
    headers,
    default: () => null,
  })
  const user = computed(() => data.value?.user ?? null)
  return { user, pending, refresh }
}
