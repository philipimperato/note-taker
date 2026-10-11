<script setup lang="ts">
const route = useRoute()
const email = computed(() => String(route.query.email ?? ''))
const otp = ref<string[]>([])
const error = ref<string | null>(null)
const busy = ref(false)
const resent = ref(false)
const { refresh } = useAuthSession()

const code = computed(() => otp.value.join(''))

async function verify() {
  if (code.value.length !== 6) {
    error.value = 'Enter the 6-digit code'
    return
  }
  busy.value = true
  error.value = null
  const r = await authCall(() => authClient.emailOtp.verifyEmail({ email: email.value, otp: code.value }), 'That code did not work')
  busy.value = false
  if (!r.ok) {
    error.value = r.message
    return
  }
  await refresh()
  await navigateTo('/')
}

async function resend() {
  error.value = null
  resent.value = false
  const r = await authCall(() => authClient.emailOtp.sendVerificationOtp({ email: email.value, type: 'email-verification' }), 'Could not resend the code')
  if (!r.ok) error.value = r.message
  else resent.value = true
}
</script>

<template>
  <AuthShell
    label="Verify email"
    title="Check your inbox"
    :intro="`We sent a 6-digit code to ${email || 'your email'}.`"
    :error="error"
  >
    <PinInput v-model="otp" :length="6" otp type="text" inputmode="numeric" size="xl" @complete="verify" />

    <Button class="mt-6" size="lg" block :loading="busy" @click="verify">Verify</Button>

    <p v-if="resent" class="mt-4 text-sm text-muted">A new code is on its way.</p>

    <template #footer>
      <button type="button" class="text-primary hover:text-primary-400" @click="resend">Resend code</button>
      <span class="mx-2">·</span>
      <NuxtLink to="/" class="hover:text-highlighted">Skip for now</NuxtLink>
    </template>
  </AuthShell>
</template>
