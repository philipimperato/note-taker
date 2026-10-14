// Autosave: stores the draft without publishing. Called only when the text actually changed.
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const date = requireDateParam(getRouterParam(event, 'date'))
  const { body } = (await readBody<{ body?: string }>(event)) ?? {}
  if (typeof body !== 'string') throw createError({ statusCode: 422, statusMessage: 'Body must be a string' })
  if (body.length > MAX_BODY_CHARS) throw createError({ statusCode: 413, statusMessage: 'Draft is too long' })
  const { draftUpdatedAt } = await saveDraft(user.id, date, body)
  return { ok: true, draftUpdatedAt }
})
