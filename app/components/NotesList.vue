<script setup lang="ts">
const props = defineProps<{
  notes: NoteSummary[]
  selected: string
  compact?: boolean // desktop sidebar rows
}>()
const emit = defineEmits<{ select: [date: string] }>()

const groups = computed(() => {
  const byMonth = new Map<string, NoteSummary[]>()
  for (const n of props.notes) {
    const ym = n.date.slice(0, 7)
    if (!byMonth.has(ym)) byMonth.set(ym, [])
    byMonth.get(ym)!.push(n)
  }
  return [...byMonth.entries()].map(([ym, items]) => ({
    ym,
    label: fromIsoDate(`${ym}-01`).toLocaleDateString(undefined, { month: 'long' }),
    items,
  }))
})

const dayNumber = (iso: string) => String(Number(iso.slice(8, 10)))
const weekday = (iso: string) => fromIsoDate(iso).toLocaleDateString(undefined, { weekday: 'long' })
</script>

<template>
  <div v-if="!notes.length" class="pt-2">
    <p class="font-serif text-[17px] leading-relaxed text-toned">No notes yet. Today is a good day to start.</p>
    <Button class="mt-5" size="lg" @click="emit('select', todayLocal())">Today</Button>
  </div>

  <!-- Desktop compact rows -->
  <div v-else-if="compact" class="flex flex-col gap-0.5">
    <template v-for="g in groups" :key="g.ym">
      <div class="label-caps px-2.5 pb-2 pt-4 text-[11px] !text-dimmed first:pt-1">{{ g.label }}</div>
      <button
        v-for="n in g.items"
        :key="n.date"
        type="button"
        class="flex w-full items-baseline gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-elevated"
        :class="{ 'bg-accented': n.date === selected }"
        @click="emit('select', n.date)"
      >
        <span class="w-[22px] flex-none font-serif text-[15px] font-medium text-highlighted">{{ dayNumber(n.date) }}</span>
        <span class="min-w-0 flex-1 truncate text-[13px] text-muted">{{ n.preview }}</span>
      </button>
    </template>
  </div>

  <!-- Mobile rows -->
  <div v-else class="flex flex-col">
    <template v-for="g in groups" :key="g.ym">
      <div class="label-caps pb-2.5 pt-6 text-xs tracking-[.08em] first:pt-0">{{ g.label }}</div>
      <button
        v-for="n in g.items"
        :key="n.date"
        type="button"
        class="flex w-full items-baseline gap-4 border-t border-default py-3.5 text-left"
        @click="emit('select', n.date)"
      >
        <span class="w-[34px] flex-none font-serif text-lg font-medium leading-tight text-highlighted">{{ dayNumber(n.date) }}</span>
        <span class="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span class="text-xs text-muted">{{ weekday(n.date) }}</span>
          <span class="line-clamp-2 font-serif text-[15px] leading-[1.45] text-toned">{{ n.preview }}</span>
        </span>
      </button>
    </template>
  </div>
</template>
