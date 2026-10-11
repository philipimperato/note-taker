<script setup lang="ts">
// Remount when the date changes so DayScreen refetches and resets its mode.
definePageMeta({ key: (route) => route.fullPath })

const route = useRoute()
const date = String(route.params.date)

// Only real, non-future days open here; today lives at /.
if (!isIsoDate(date) || date > todayLocal()) await navigateTo('/', { replace: true })
else if (date === todayLocal()) await navigateTo('/', { replace: true })
</script>

<template>
  <DayScreen :date="date" />
</template>
