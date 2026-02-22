<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const code = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const resendTimer = ref(0)

const email = computed(() => authStore.pendingEmail || '')
const canResend = computed(() => resendTimer.value === 0)

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  const result = await authStore.verifyCode(email.value, code.value)

  isSubmitting.value = false

  if (result.status === 'success') {
    await router.push('/dashboard')
  } else {
    errorMessage.value = result.error || t('error.auth.invalidCode')
  }
}

async function handleResend() {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/auth/resend-code', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })

    if (response.ok) {
      resendTimer.value = 60
      const interval = setInterval(() => {
        resendTimer.value--
        if (resendTimer.value === 0) clearInterval(interval)
      }, 1000)
    } else {
      const data = await response.json()
      errorMessage.value = data.error || t('error.server')
    }
  } catch (e) {
    errorMessage.value = e.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <v-container class="fill-height">
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="6"
        lg="4"
      >
        <v-card class="pa-6">
          <v-card-title class="text-center mb-2">
            {{ t('verify.title') }}
          </v-card-title>
          <p class="text-center text-subtitle-2 mb-1">
            {{ t('verify.subtitle') }}
          </p>
          <p class="text-center text-body-2 font-weight-bold mb-6">
            {{ email }}
          </p>

          <v-alert
            v-if="errorMessage"
            type="error"
            class="mb-4"
            closable
          >
            {{ errorMessage }}
          </v-alert>

          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="code"
              :label="t('form.code')"
              type="text"
              placeholder="000000"
              class="mb-6"
              :disabled="isSubmitting"
              maxlength="6"
              required
            />

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="isSubmitting"
            >
              {{ t('form.submit') }}
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <p class="text-center mb-0">
            <v-btn
              variant="text"
              size="small"
              :disabled="!canResend || isSubmitting"
              @click="handleResend"
            >
              {{ canResend ? t('verify.resend') : t('verify.resendIn', { seconds: resendTimer }) }}
            </v-btn>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
