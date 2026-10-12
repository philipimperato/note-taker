// Save: validates, resolves verses, publishes the day.
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const date = requireDateParam(getRouterParam(event, 'date'))
  const { body, today } = (await readBody<{ body?: string; today?: string }>(event)) ?? {}
  if (typeof body !== 'string' || !body.trim()) throw createError({ statusCode: 422, statusMessage: 'Body is empty' })
  if (body.length > MAX_BODY_CHARS) throw createError({ statusCode: 413, statusMessage: 'Note is too long' })
  if (wordCount(body) > 1000) throw createError({ statusCode: 422, statusMessage: 'Over 1000 words' })
  if (date > requireDateParam(today, 'today')) throw createError({ statusCode: 422, statusMessage: 'Future date' })
  await cacheVerses(body)
  await publishNote(user.id, date, body)
  return { ok: true }
})
