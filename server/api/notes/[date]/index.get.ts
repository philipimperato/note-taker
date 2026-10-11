export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const date = requireDateParam(getRouterParam(event, 'date'))
  const note = await getNote(user.id, date)
  return { note: note ?? null, verses: note?.body ? await versesFor(note.body) : {} }
})
