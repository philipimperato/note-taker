<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

const route = useRoute()
const email = computed(() => String(route.query.email ?? ''))
const otp = ref<string[]>([])
const state = reactive({ password: '' })
const error = ref<string | null>(null)
const busy = ref(false)

function validate(s: typeof state): FormError[] {
  return s.password.length >= 8 ? [] : [{ name: 'password', message: 'Use at least 8 characters' }]
}

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  const code = otp.value.join('')
  if (code.length !== 6) {
    error.value = 'Enter the 6-digit code'
    return
  }
  busy.value = true
  error.value = null
  const r = await authCall(() => authClient.emailOtp.resetPassword({ email: email.value, otp: code, password: event.data.password }), 'Could not reset your password')
  busy.value = false
  if (!r.ok) {
    error.value = r.message
    return
  }
  await navigateTo('/auth/sign-in')
}
</script>

<template>
  <AuthShell
    label="Reset password"
    title="Choose a new password"
    :intro="`Enter the code we sent to ${email || 'your email'}.`"
    :error="error"
  >
    <Form :state="state" :validate="validate" class="space-y-5" @submit="onSubmit">
      <FormField label="Code" name="otp">
        <PinInput v-model="otp" :length="6" otp type="text" inputmode="numeric" size="xl" />
      </FormField>
      <FormField label="New password" name="password" hint="8+ characters">
        <Input v-model="state.password" type="password" autocomplete="new-password" class="w-full" />
      </FormField>
      <Button type="submit" size="lg" block :loading="busy">Reset password</Button>
    </Form>

    <template #footer>
      <NuxtLink to="/auth/forgot-password" class="hover:text-highlighted">Send a new code</NuxtLink>
    </template>
  </AuthShell>
</template>
