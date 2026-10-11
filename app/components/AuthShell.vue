<script setup lang="ts">
defineProps<{
  label: string
  title: string
  intro?: string
  error?: string | null
}>()
</script>

<template>
  <div class="mx-auto w-full max-w-[400px] px-6 pt-16 lg:pt-24">
    <span class="label-caps text-muted">{{ label }}</span>
    <h1 class="heading-date mt-2">{{ title }}</h1>
    <p v-if="intro" class="mt-3 font-serif text-[17px] leading-relaxed text-toned">{{ intro }}</p>

    <Alert
      v-if="error"
      color="error"
      variant="soft"
      :title="error"
      class="mt-6"
    />

    <div class="mt-8">
      <slot />
    </div>

    <p v-if="$slots.footer" class="mt-8 text-sm text-muted">
      <slot name="footer" />
    </p>
  </div>
</template>
