<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const state = reactive({ name: '', email: '', password: '' })
const error = ref<string | null>(null)
const busy = ref(false)
const { refresh } = useAuthSession()

function validate(s: typeof state): FormError[] {
  const errors: FormError[] = []
  if (!s.name.trim()) errors.push({ name: 'name', message: 'Enter your name' })
  if (!s.email.includes('@')) errors.push({ name: 'email', message: 'Enter your email address' })
  if (s.password.length < 8) errors.push({ name: 'password', message: 'Use at least 8 characters' })
  return errors
}

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  busy.value = true
  error.value = null
  const { email, password, name } = event.data
  const r = await authCall(() => authClient.signUp.email({ email, password, name }), 'Could not create your account')
  if (!r.ok) {
    busy.value = false
    error.value = r.message
    return
  }
  // Verification is optional on this branch, but we still send the code so the address can be confirmed.
  await authCall(() => authClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' }), '')
  await refresh()
  busy.value = false
  await navigateTo({ path: '/auth/verify', query: { email } })
}
</script>

<template>
  <AuthShell label="Sign up" title="Start your notes" :error="error">
    <Form :state="state" :validate="validate" class="space-y-5" @submit="onSubmit">
      <FormField label="Name" name="name">
        <Input v-model="state.name" autocomplete="name" class="w-full" />
      </FormField>
      <FormField label="Email" name="email">
        <Input v-model="state.email" type="email" autocomplete="email" placeholder="you@example.com" class="w-full" />
      </FormField>
      <FormField label="Password" name="password" hint="8+ characters">
        <Input v-model="state.password" type="password" autocomplete="new-password" class="w-full" />
      </FormField>
      <Button type="submit" size="lg" block :loading="busy">Create account</Button>
    </Form>

    <template #footer>
      Already have an account?
      <NuxtLink to="/auth/sign-in" class="text-primary hover:text-primary-400">Sign in</NuxtLink>
    </template>
  </AuthShell>
</template>
