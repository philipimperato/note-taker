<script setup lang="ts">
const props = defineProps<{
  selected: string
  compact?: boolean // desktop sidebar; otherwise the mobile sheet
}>()
const emit = defineEmits<{ select: [date: string, hasNote: boolean]; close: [] }>()

const { view, notes, previews, savedDates } = useNotesMenu()
const { data: streakData } = await useFetch<{ days: number }>('/api/streak', {
  query: { today: todayLocal() },
  key: 'streak',
  default: () => ({ days: 0 }),
})

const tabs = [
  { label: 'List', value: 'list' },
  { label: 'Calendar', value: 'calendar' },
]

const streakLine = computed(() => {
  const n = streakData.value.days
  return n === 0 ? 'Start a new streak' : `${n} day${n === 1 ? '' : 's'} in a row`
})

function pick(date: string, hasNote = savedDates.value.has(date)) {
  emit('select', date, hasNote)
}
</script>

<template>
  <!-- Desktop sidebar -->
  <aside v-if="compact" class="flex h-full w-[272px] flex-none flex-col gap-[22px] border-r border-default bg-muted px-5 py-7">
    <div class="flex items-center justify-between">
      <span class="font-serif text-[17px] font-medium text-highlighted">Notes</span>
      <Tabs v-model="view" :items="tabs" :content="false" size="xs" :ui="{ trigger: 'h-[26px] px-3 text-xs' }" />
    </div>

    <Button block class="h-10" @click="pick(todayLocal())">Today</Button>

    <div class="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
      <NotesList v-if="view === 'list'" :notes="notes" :selected="selected" compact @select="pick" />
      <NotesCalendar v-else :selected="selected" :previews="previews" compact @select="pick" />
    </div>

    <div class="flex items-center gap-2 text-[13px] text-muted">
      <span class="size-1.5 rounded-full bg-primary" />{{ streakLine }}
    </div>
  </aside>

  <!-- Mobile full-screen sheet -->
  <div v-else class="flex min-h-dvh flex-col bg-default px-6 pb-10 pt-3">
    <div class="-mx-2 flex h-[54px] items-center justify-between">
      <Button color="neutral" variant="ghost" icon="i-lucide-x" aria-label="Close" square class="size-11" @click="emit('close')" />
      <Tabs v-model="view" :items="tabs" :content="false" />
      <span class="w-[34px]" />
    </div>

    <template v-if="view === 'list'">
      <h1 class="heading-date mt-5">Notes</h1>
      <div class="mt-[22px]">
        <NotesList :notes="notes" :selected="selected" @select="pick" />
      </div>
    </template>
    <div v-else class="mt-5">
      <NotesCalendar :selected="selected" :previews="previews" @select="pick" />
    </div>
  </div>
</template>
