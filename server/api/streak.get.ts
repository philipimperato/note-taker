// Streak, computed from the client's local date (?today=YYYY-MM-DD).
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const today = requireDateParam(getQuery(event).today as string | undefined, 'today')
  return { days: await streak(user.id, today) }
})
