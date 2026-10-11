<script setup lang="ts">
const { user, refresh } = useAuthSession()
async function signOut() {
  await authCall(() => authClient.signOut(), 'Could not sign out')
  await refresh()
  await navigateTo('/auth/sign-in')
}
</script>

<template>
  <App>
    <div class="min-h-dvh flex flex-col bg-default text-default">
      <NuxtRouteAnnouncer />
      <main class="flex-1">
        <NuxtPage />
      </main>
      <footer class="flex items-center justify-center gap-4 px-6 py-4">
        <span class="label-caps text-dimmed">NoteTaker</span>
        <button v-if="user" type="button" class="text-xs text-dimmed hover:text-muted" @click="signOut">Sign out</button>
      </footer>
    </div>
  </App>
</template>
