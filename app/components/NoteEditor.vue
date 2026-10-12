<script setup lang="ts">
const model = defineModel<string>({ required: true })
const props = defineProps<{ autofocus?: boolean }>()
const emit = defineEmits<{ save: [] }>()

const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const mirror = useTemplateRef<HTMLDivElement>('mirror')

// Overlay highlighting: the textarea's text is transparent (caret stays visible) and a
// mirror div underneath renders the same text with [Book C:V] tokens styled.
const segments = computed(() => {
  const out: { text: string; token: boolean }[] = []
  let last = 0
  for (const m of model.value.matchAll(VERSE_TOKEN)) {
    if (!isVerseToken(m[0])) continue
    if (m.index! > last) out.push({ text: model.value.slice(last, m.index), token: false })
    out.push({ text: m[0], token: true })
    last = m.index! + m[0].length
  }
  out.push({ text: model.value.slice(last), token: false })
  return out
})

function resize() {
  const el = textarea.value
  if (!el) return
  el.style.height = '0px'
  el.style.height = `${Math.max(el.scrollHeight, 240)}px`
}

// Ctrl+Enter / Cmd+Enter saves.
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    emit('save')
  }
}

function insertVerseBrackets() {
  const el = textarea.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  model.value = model.value.slice(0, start) + '[]' + model.value.slice(end)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + 1, start + 1)
    resize()
  })
}

watch(model, () => nextTick(resize))
onMounted(() => {
  resize()
  if (props.autofocus) textarea.value?.focus()
})
</script>

<template>
  <div class="flex flex-col">
    <div class="relative">
      <div
        ref="mirror"
        aria-hidden="true"
        class="prose-note pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words"
      >
        <template v-for="(s, i) in segments" :key="i">
          <span v-if="s.token" class="verse-token">{{ s.text }}</span>
          <template v-else>{{ s.text }}</template>
        </template>
        <!-- trailing newline keeps the mirror's height in step with the textarea -->
        <br />
      </div>
      <textarea
        ref="textarea"
        v-model="model"
        class="prose-note relative block w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-transparent caret-primary outline-none placeholder:italic placeholder:text-dimmed"
        placeholder="Start writing…"
        spellcheck="true"
        @input="resize"
        @keydown="onKeydown"
      />
    </div>

    <!-- Mobile: insert-verse chip above the keyboard -->
    <div class="sticky bottom-0 -mx-6 mt-4 flex items-center gap-3 border-t border-default bg-default px-4 py-3 lg:hidden">
      <button
        type="button"
        class="flex h-[34px] items-center gap-2 rounded-full bg-accented px-3.5 text-[13px] font-medium text-highlighted"
        @click="insertVerseBrackets"
      >
        <span class="font-mono text-primary">[ ]</span>Insert verse
      </button>
      <span class="text-xs leading-tight text-dimmed">Type a reference like [John 3:16]</span>
    </div>

    <!-- Desktop: hint line -->
    <p class="mt-6 hidden text-[13px] leading-relaxed text-dimmed lg:block">
      Verses: type a reference in brackets — [John 3:16] — and it fills in when you save.
      Autosaves a draft every 30s; Save (or Ctrl+Enter) publishes the day.
    </p>
  </div>
</template>
