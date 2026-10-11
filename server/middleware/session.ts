// Attaches the Neon Auth user to event.context.user for API requests.
// Skips the auth proxy itself and non-API routes (pages, assets).
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/') || path.startsWith('/api/auth')) return
  event.context.user = await getSessionUser(event)
})
