<script setup lang="ts">
const route = useRoute()
const date = String(route.params.date)

// Only real, non-future days open here; today lives at /.
if (!isIsoDate(date) || date > todayLocal()) await navigateTo('/', { replace: true })
else if (date === todayLocal()) await navigateTo('/', { replace: true })
</script>

<template>
  <DayScreen :date="date" />
</template>
