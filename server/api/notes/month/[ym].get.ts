// Calendar: dates in the month that have a saved note.
export default defineEventHandler((event) => {
  const user = requireUser(event)
  return savedDatesInMonth(user.id, requireMonthParam(getRouterParam(event, 'ym')))
})
