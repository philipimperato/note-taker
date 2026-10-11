// Notes list: saved days, newest first, with a first-line preview.
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const rows = await listSavedNotes(user.id)
  return rows.map((r) => ({ date: r.noteDate, preview: r.body!.split('\n').find((l) => l.trim()) ?? '' }))
})
