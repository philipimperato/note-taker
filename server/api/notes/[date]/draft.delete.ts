// Discard changes: drops the draft and keeps whatever was last saved.
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const date = requireDateParam(getRouterParam(event, 'date'))
  await discardDraft(user.id, date)
  return { ok: true }
})
