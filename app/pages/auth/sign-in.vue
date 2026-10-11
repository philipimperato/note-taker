<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const state = reactive({ email: '', password: '' })
const error = ref<string | null>(null)
const busy = ref(false)
const { refresh } = useAuthSession()

function validate(s: typeof state): FormError[] {
  const errors: FormError[] = []
  if (!s.email.includes('@')) errors.push({ name: 'email', message: 'Enter your email address' })
  if (!s.password) errors.push({ name: 'password', message: 'Enter your password' })
  return errors
}

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  busy.value = true
  error.value = null
  const r = await authCall(() => authClient.signIn.email({ email: event.data.email, password: event.data.password }), 'Could not sign in')
  busy.value = false
  if (!r.ok) {
    error.value = r.message
    return
  }
  await refresh()
  await navigateTo('/')
}

async function withGoogle() {
  error.value = null
  const r = await authCall(() => authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/` }), 'Could not start Google sign-in')
  if (!r.ok) error.value = r.message
}
</script>

<template>
  <AuthShell label="Sign in" title="Welcome back" :error="error">
    <Form :state="state" :validate="validate" class="space-y-5" @submit="onSubmit">
      <FormField label="Email" name="email">
        <Input v-model="state.email" type="email" autocomplete="email" placeholder="you@example.com" class="w-full" />
      </FormField>
      <FormField label="Password" name="password">
        <Input v-model="state.password" type="password" autocomplete="current-password" class="w-full" />
        <template #hint>
          <NuxtLink to="/auth/forgot-password" class="text-muted hover:text-highlighted">Forgot?</NuxtLink>
        </template>
      </FormField>
      <Button type="submit" size="lg" block :loading="busy">Sign in</Button>
    </Form>

    <Separator label="or" class="my-6" />
    <Button variant="outline" size="lg" block icon="i-simple-icons-google" @click="withGoogle">Continue with Google</Button>

    <template #footer>
      New here?
      <NuxtLink to="/auth/sign-up" class="text-primary hover:text-primary-400">Create an account</NuxtLink>
    </template>
  </AuthShell>
</template>
