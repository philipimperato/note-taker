<script setup lang="ts">
const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
const { user, refresh } = useAuthSession()

async function signOut() {
  await authCall(() => authClient.signOut(), 'Could not sign out')
  await refresh()
  await navigateTo('/auth/sign-in')
}
</script>

<template>
  <div class="mx-auto max-w-[660px] px-6 pt-16 lg:px-10">
    <div class="flex items-center justify-between">
      <span class="label-caps text-muted">Today</span>
      <Button variant="outline" size="md" @click="signOut">Sign out</Button>
    </div>
    <h1 class="heading-date mt-2">{{ today }}</h1>
    <p v-if="user" class="mt-2 text-sm text-muted">Signed in as {{ user.name || user.email }}</p>
    <p class="prose-note mt-6 italic text-dimmed">
      Start writing. Nothing is saved until you tap Save.
    </p>
    <Button size="lg" class="mt-8">Start today's note</Button>
  </div>
</template>
