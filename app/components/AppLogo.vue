<script setup lang="ts">
// The mark: the verse-token bracket pair [ ] with a single dot for the day.
// Inline so it can be sized and tinted with CSS; source files live in /logo.
withDefaults(defineProps<{ size?: number }>(), { size: 32 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    class="shrink-0 text-primary"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M14 10h10v6h-4v32h4v6H14z" fill="currentColor" />
    <path d="M50 10H40v6h4v32h-4v6h10z" fill="currentColor" />
    <circle cx="32" cy="32" r="4" fill="currentColor" />
  </svg>
</template>
