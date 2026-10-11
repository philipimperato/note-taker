<template>
  <App>
    <div class="min-h-dvh flex flex-col bg-default text-default">
      <NuxtRouteAnnouncer />
      <main class="flex-1">
        <NuxtPage />
      </main>
      <footer class="px-6 py-4 text-center">
        <span class="label-caps text-dimmed">NoteTaker</span>
      </footer>
    </div>
  </App>
</template>
