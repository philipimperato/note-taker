<script setup lang="ts">
import type { Verse } from '~~/server/db/schema'

const props = defineProps<{
  body: string
  verses: Record<string, Pick<Verse, 'text'>>
}>()

type Piece =
  | { kind: 'p'; text: string }
  | { kind: 'verse'; label: string; text: string }
  | { kind: 'missing'; label: string; raw: string }

// Blank lines split paragraphs. A token becomes its own block where it was typed,
// splitting the surrounding paragraph text around it.
const pieces = computed<Piece[]>(() => {
  const out: Piece[] = []
  for (const para of props.body.split(/\n\s*\n/)) {
    let last = 0
    for (const m of para.matchAll(VERSE_TOKEN)) {
      const before = para.slice(last, m.index).trim()
      if (before) out.push({ kind: 'p', text: before })
      const [t] = parseTokens(m[0])
      const verse = props.verses[normalizeRef(t!)]
      if (verse) out.push({ kind: 'verse', label: displayRef(t!), text: verse.text })
      else out.push({ kind: 'missing', label: displayRef(t!), raw: m[0] })
      last = m.index! + m[0].length
    }
    const rest = para.slice(last).trim()
    if (rest) out.push({ kind: 'p', text: rest })
  }
  return out
})
</script>

<template>
  <div class="prose-note flex flex-col gap-[18px] lg:gap-5">
    <template v-for="(piece, i) in pieces" :key="i">
      <p v-if="piece.kind === 'p'" class="whitespace-pre-line">{{ piece.text }}</p>
      <div v-else-if="piece.kind === 'verse'" class="verse-callout">
        <div class="ref">{{ piece.label }}</div>
        <div class="text">{{ piece.text }}</div>
      </div>
      <p v-else class="text-sm">
        <span class="verse-token opacity-60">{{ piece.raw }}</span>
        <span class="ml-2 text-dimmed">Couldn't find {{ piece.label }}</span>
      </p>
    </template>
  </div>
</template>
