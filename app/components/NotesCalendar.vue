<script setup lang="ts">
const props = defineProps<{
  selected: string
  previews: Record<string, string>
  compact?: boolean // desktop sidebar
}>()
const emit = defineEmits<{ select: [date: string, hasNote: boolean] }>()

const today = todayLocal()
const ym = ref(props.selected.slice(0, 7))

const { data: dates } = await useFetch<string[]>(() => `/api/notes/month/${ym.value}`, {
  key: () => `month:${ym.value}`,
  default: () => [],
})
const dotted = computed(() => new Set(dates.value))

const monthLabel = computed(() =>
  fromIsoDate(`${ym.value}-01`).toLocaleDateString(undefined, props.compact ? { month: 'long', year: 'numeric' } : { month: 'long' }),
)

function shiftMonth(delta: number) {
  const [y, m] = ym.value.split('-').map(Number)
  const d = new Date(y!, m! - 1 + delta, 1)
  ym.value = toIsoDate(d).slice(0, 7)
}

// Monday-first grid of { iso, day } with leading blanks.
const cells = computed(() => {
  const [y, m] = ym.value.split('-').map(Number)
  const first = new Date(y!, m! - 1, 1)
  const lead = (first.getDay() + 6) % 7
  const count = new Date(y!, m!, 0).getDate()
  const out: ({ iso: string; day: number } | null)[] = Array.from({ length: lead }, () => null)
  for (let d = 1; d <= count; d++) out.push({ iso: toIsoDate(new Date(y!, m! - 1, d)), day: d })
  return out
})

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const selectedLabel = computed(() =>
  fromIsoDate(props.selected).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
  ' · ' +
  fromIsoDate(props.selected).toLocaleDateString(undefined, { weekday: 'long' }),
)

// Swipe between months on touch.
let touchX = 0
const onTouchStart = (e: TouchEvent) => (touchX = e.touches[0]!.clientX)
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0]!.clientX - touchX
  if (Math.abs(dx) > 50) shiftMonth(dx < 0 ? 1 : -1)
}
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between" :class="compact ? '' : ''">
      <h2 v-if="compact" class="font-serif text-[15px] font-medium text-highlighted">{{ monthLabel }}</h2>
      <h2 v-else class="heading-date">{{ monthLabel }}</h2>
      <div class="flex gap-1.5">
        <Button color="neutral" variant="outline" icon="i-lucide-chevron-left" aria-label="Previous month" :class="compact ? 'size-7 rounded-full' : 'size-9 rounded-full'" @click="shiftMonth(-1)" />
        <Button color="neutral" variant="outline" icon="i-lucide-chevron-right" aria-label="Next month" :class="compact ? 'size-7 rounded-full' : 'size-9 rounded-full'" @click="shiftMonth(1)" />
      </div>
    </div>

    <div class="grid grid-cols-7 gap-y-0.5" :class="compact ? 'mt-3' : 'mt-5'" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <div v-for="(w, i) in WEEKDAYS" :key="i" class="pb-2.5 text-center text-[11px] font-medium tracking-[.06em] text-dimmed">{{ w }}</div>

      <template v-for="(c, i) in cells" :key="i">
        <div v-if="!c" />
        <button
          v-else
          type="button"
          :disabled="c.iso > today"
          class="flex flex-col items-center justify-center gap-[5px]"
          :class="compact ? 'h-10' : 'h-[50px]'"
          @click="emit('select', c.iso, dotted.has(c.iso))"
        >
          <span
            class="flex items-center justify-center rounded-full font-serif"
            :class="[
              compact ? 'size-7 text-[13px]' : 'size-[34px] text-base',
              c.iso === today ? 'bg-primary text-[#1a120d]' : c.iso > today ? 'text-ink-600' : 'text-highlighted',
              c.iso === selected && c.iso !== today ? 'ring-1 ring-accented' : '',
              c.iso === selected && c.iso === today ? 'ring-2 ring-offset-2 ring-offset-default ring-accented' : '',
            ]"
          >{{ c.day }}</span>
          <span class="size-[5px] rounded-full" :class="dotted.has(c.iso) ? 'bg-primary' : 'bg-transparent'" />
        </button>
      </template>
    </div>

    <!-- Mobile: preview of the selected day -->
    <div v-if="!compact" class="mt-5 border-t border-default pt-[18px]">
      <div class="text-xs text-muted">{{ selectedLabel }}</div>
      <p v-if="previews[selected]" class="mt-1.5 line-clamp-2 font-serif text-[15px] leading-[1.45] text-toned">{{ previews[selected] }}</p>
      <p v-else class="mt-1.5 font-serif text-[15px] italic text-dimmed">Nothing written this day.</p>
    </div>
  </div>
</template>
