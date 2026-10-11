<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const state = reactive({ email: '' })
const error = ref<string | null>(null)
const busy = ref(false)

function validate(s: typeof state): FormError[] {
  return s.email.includes('@') ? [] : [{ name: 'email', message: 'Enter your email address' }]
}

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  busy.value = true
  error.value = null
  const { email } = event.data
  const r = await authCall(() => authClient.emailOtp.sendVerificationOtp({ email, type: 'forget-password' }), 'Could not send a reset code')
  busy.value = false
  if (!r.ok) {
    error.value = r.message
    return
  }
  await navigateTo({ path: '/auth/reset-password', query: { email } })
}
</script>

<template>
  <AuthShell
    label="Reset password"
    title="Forgot your password?"
    intro="Enter your email and we'll send a 6-digit code."
    :error="error"
  >
    <Form :state="state" :validate="validate" class="space-y-5" @submit="onSubmit">
      <FormField label="Email" name="email">
        <Input v-model="state.email" type="email" autocomplete="email" placeholder="you@example.com" class="w-full" />
      </FormField>
      <Button type="submit" size="lg" block :loading="busy">Send code</Button>
    </Form>

    <template #footer>
      <NuxtLink to="/auth/sign-in" class="hover:text-highlighted">Back to sign in</NuxtLink>
    </template>
  </AuthShell>
</template>
