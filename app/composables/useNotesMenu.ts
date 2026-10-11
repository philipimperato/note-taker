export type NoteSummary = { date: string; preview: string }
export type MenuView = 'list' | 'calendar'

const VIEW_KEY = 'notes-menu-view'

function readStoredView(): MenuView {
  try {
    const v = localStorage.getItem(VIEW_KEY)
    return v === 'calendar' ? 'calendar' : 'list'
  } catch {
    return 'list'
  }
}

/** Shared state for the Notes menu: open/closed, List|Calendar choice, and the saved-notes index. */
export function useNotesMenu() {
  const open = useState('notes-menu-open', () => false)
  const view = useState<MenuView>('notes-menu-view', () => (import.meta.client ? readStoredView() : 'list'))

  watch(view, (v) => {
    try {
      localStorage.setItem(VIEW_KEY, v)
    } catch {
      /* private mode etc. */
    }
  })

  const { data: notes, refresh: refreshNotes } = useFetch<NoteSummary[]>('/api/notes', {
    key: 'notes-index',
    default: () => [],
  })

  const previews = computed(() => Object.fromEntries(notes.value.map((n) => [n.date, n.preview])))
  const savedDates = computed(() => new Set(notes.value.map((n) => n.date)))

  return { open, view, notes, previews, savedDates, refreshNotes }
}
