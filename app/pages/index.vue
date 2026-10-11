<script setup lang="ts">
const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
</script>

<template>
  <div class="mx-auto max-w-[660px] px-6 pt-16 lg:px-10">
    <span class="label-caps text-muted">Today</span>
    <h1 class="heading-date mt-2">{{ today }}</h1>
    <p class="prose-note mt-6 italic text-dimmed">
      Start writing. Nothing is saved until you tap Save.
    </p>
    <Button size="lg" class="mt-8">Start today's note</Button>
  </div>
</template>
