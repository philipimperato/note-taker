<script setup lang="ts">
import type { Note, Verse } from '~~/server/db/schema'

const props = defineProps<{ date: string }>()

const today = todayLocal()
const isToday = computed(() => props.date === today)
const route = useRoute()
const { open: menuOpen, refreshNotes } = useNotesMenu()
const sidebar = useState('notes-sidebar', () => false) // desktop: collapsed by default, hamburger toggles

type DayPayload = { note: Note | null; verses: Record<string, Verse> }
const { data, refresh } = await useFetch<DayPayload>(() => `/api/notes/${props.date}`, {
  key: () => `day:${props.date}`,
  default: () => ({ note: null, verses: {} }),
})
const { data: streakData, refresh: refreshStreak } = await useFetch<{ days: number }>('/api/streak', {
  query: { today },
  key: 'streak',
  default: () => ({ days: 0 }),
})

const note = computed(() => data.value.note)
const hasNote = computed(() => !!note.value?.body?.trim())
const streak = computed(() => streakData.value.days)

const mode = ref<'view' | 'edit'>('view')
const draft = ref('')
const saving = ref(false)
const saveError = ref<string | null>(null)

const words = computed(() => wordCount(draft.value))
const overLimit = computed(() => words.value > WORD_LIMIT)
const dirty = computed(() => draft.value !== (note.value?.draftBody ?? note.value?.body ?? ''))

function startEdit() {
  draft.value = note.value?.draftBody ?? note.value?.body ?? ''
  mode.value = 'edit'
}

// Calendar opens past empty days straight into edit (?edit=1).
if (route.query.edit === '1' && !hasNote.value) startEdit()

function toggleMenu() {
  if (window.matchMedia('(min-width: 1024px)').matches) sidebar.value = !sidebar.value
  else menuOpen.value = true
}

async function openDay(date: string, hasNote: boolean) {
  menuOpen.value = false
  if (date === today) return navigateTo('/')
  return navigateTo({ path: `/day/${date}`, query: hasNote ? {} : { edit: '1' } })
}

async function autosave() {
  if (mode.value !== 'edit' || !dirty.value) return
  try {
    await $fetch(`/api/notes/${props.date}/draft`, { method: 'PUT', body: { body: draft.value } })
  } catch {
    /* best effort; the next tick or Save will retry */
  }
}
const timer = setInterval(autosave, 30_000)
onBeforeUnmount(() => clearInterval(timer))

async function save() {
  if (overLimit.value || !draft.value.trim()) return
  saving.value = true
  saveError.value = null
  try {
    await $fetch(`/api/notes/${props.date}`, { method: 'PUT', body: { body: draft.value, today } })
    await Promise.all([refresh(), refreshStreak(), refreshNotes()])
    mode.value = 'view'
  } catch (e) {
    saveError.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Could not save'
  } finally {
    saving.value = false
  }
}

const streakLine = computed(() => {
  if (streak.value === 0) return 'Start a new streak'
  const base = `${streak.value} day${streak.value === 1 ? '' : 's'} in a row`
  return hasNote.value || !isToday.value ? base : `${base} — keep it going`
})
</script>

<template>
  <div class="flex min-h-dvh">
    <!-- Desktop sidebar (toggled by the hamburger) -->
    <div v-if="sidebar" class="sticky top-0 hidden h-dvh lg:block">
      <NotesMenu :selected="date" compact @select="openDay" />
    </div>

    <!-- Mobile full-screen sheet -->
    <Slideover v-model:open="menuOpen" side="left" :close="false" :ui="{ content: 'w-screen max-w-none' }">
      <template #content>
        <NotesMenu :selected="date" @select="openDay" @close="menuOpen = false" />
      </template>
    </Slideover>

  <div class="flex min-h-dvh min-w-0 flex-1 flex-col">
    <!-- Top bar -->
    <header class="sticky top-0 z-10 flex h-[66px] items-center justify-between bg-default px-4 pt-3 lg:static lg:px-7 lg:pt-5">
      <div class="flex items-center gap-3.5">
        <Button color="neutral" variant="ghost" icon="i-lucide-menu" aria-label="Notes" class="size-11 lg:size-9" @click="toggleMenu" />
        <span v-if="mode === 'view'" class="label-caps hidden lg:inline">{{ isToday ? 'Today' : shortDate(date) }}</span>
      </div>

      <span v-if="mode === 'view'" class="label-caps lg:hidden">{{ isToday ? 'Today' : shortDate(date) }}</span>
      <span
        v-else
        class="text-[13px]"
        :class="overLimit ? 'text-primary' : 'text-muted'"
      >{{ words }} / {{ WORD_LIMIT }} words</span>

      <div class="flex items-center gap-4">
        <template v-if="mode === 'view'">
          <span v-if="hasNote && note?.savedAt" class="hidden text-[13px] text-muted lg:inline">
            Saved {{ clockTime(String(note.savedAt)) }}
          </span>
          <Button v-if="hasNote" variant="outline" @click="startEdit">Edit</Button>
          <span v-else class="w-9" />
        </template>
        <Button v-else :disabled="overLimit || !draft.trim()" :loading="saving" @click="save">Save</Button>
      </div>
    </header>

    <main class="mx-auto flex w-full max-w-[660px] flex-1 flex-col px-6 pb-10 pt-4 lg:px-10 lg:pt-10">
      <h1 class="heading-date">{{ headingDate(date) }}</h1>

      <!-- Streak line: shown in view + empty, hidden while editing -->
      <div v-if="mode === 'view'" class="mt-2 flex items-center gap-2 text-[13px] text-muted">
        <span class="size-1.5 rounded-full bg-primary" />{{ streakLine }}
      </div>

      <Alert v-if="saveError" color="error" variant="soft" :title="saveError" class="mt-4" />

      <!-- Edit -->
      <div v-if="mode === 'edit'" class="mt-6 flex flex-1 flex-col">
        <NoteEditor v-model="draft" autofocus />
      </div>

      <!-- View -->
      <div v-else-if="hasNote" class="mt-7">
        <NoteBody :body="note!.body!" :verses="data.verses" />
      </div>

      <!-- Empty -->
      <div v-else class="mt-7 flex flex-1 flex-col">
        <button type="button" class="prose-note cursor-text text-left italic text-dimmed" @click="startEdit">
          Start writing. Nothing is saved until you
          <span class="lg:hidden">tap</span><span class="hidden lg:inline">click</span> Save.
          Drop in a verse by typing its reference in brackets, like [Psalm 23:1].
        </button>
        <Button size="lg" class="mt-10 hidden self-start lg:inline-flex" @click="startEdit">
          {{ isToday ? "Start today's note" : 'Write this day' }}
        </Button>
        <div class="mt-auto pt-10 lg:hidden">
          <Button size="xl" block @click="startEdit">{{ isToday ? "Start today's note" : 'Write this day' }}</Button>
        </div>
      </div>
    </main>
  </div>
  </div>
</template>
