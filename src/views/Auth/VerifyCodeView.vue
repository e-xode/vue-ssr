<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocalePath } from '@/composables/useLocalePath'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { localePath } = useLocalePath()

const CODE_LENGTH = 6
const EXPIRY_SECONDS = 600

const digits = ref(Array(CODE_LENGTH).fill(''))
const isSubmitting = ref(false)
const errorMessage = ref('')
const attemptsRemaining = ref(null)
const timeRemaining = ref(EXPIRY_SECONDS)
const resendTimer = ref(0)

const email = computed(() => authStore.pendingEmail || '')
const canResend = computed(() => resendTimer.value === 0)
const codeValue = computed(() => digits.value.join(''))
const isCodeComplete = computed(() => codeValue.value.length === CODE_LENGTH)
const timerMinutes = computed(() => Math.floor(timeRemaining.value / 60))
const timerSeconds = computed(() => String(timeRemaining.value % 60).padStart(2, '0'))
const timerProgress = computed(() => (timeRemaining.value / EXPIRY_SECONDS) * 100)
const timerWarning = computed(() => timeRemaining.value < 120)

let expiryInterval = null
let resendInterval = null

function getInputs() {
  return document.querySelectorAll('.code-digit')
}

function startExpiryTimer() {
  clearInterval(expiryInterval)
  expiryInterval = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      clearInterval(expiryInterval)
      errorMessage.value = t('verify.codeExpired')
    }
  }, 1000)
}

function startResendTimer(seconds) {
  clearInterval(resendInterval)
  resendTimer.value = seconds
  resendInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value === 0) clearInterval(resendInterval)
  }, 1000)
}

onMounted(() => {
  if (!email.value) {
    router.push(localePath('/signin'))
    return
  }
  startExpiryTimer()
  nextTick(() => getInputs()[0]?.focus())
})

onUnmounted(() => {
  clearInterval(expiryInterval)
  clearInterval(resendInterval)
})

function handleInput(index) {
  const val = digits.value[index]
  if (val && !/^\d$/.test(val)) {
    digits.value[index] = ''
    return
  }
  if (val && index < CODE_LENGTH - 1) {
    getInputs()[index + 1]?.focus()
  }
  errorMessage.value = ''
  attemptsRemaining.value = null
}

function handleKeyDown(index, event) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    getInputs()[index - 1]?.focus()
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
  if (!pasted) return
  for (let i = 0; i < CODE_LENGTH; i++) {
    digits.value[i] = pasted[i] || ''
  }
  const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1)
  nextTick(() => getInputs()[focusIndex]?.focus())
}

async function handleSubmit() {
  if (!isCodeComplete.value || isSubmitting.value) return
  errorMessage.value = ''
  isSubmitting.value = true

  const result = await authStore.verifyCode(email.value, codeValue.value)

  isSubmitting.value = false

  if (result.status === 'success') {
    await router.push(localePath('/dashboard'))
  } else {
    digits.value = Array(CODE_LENGTH).fill('')
    if (result.attempts !== undefined) {
      attemptsRemaining.value = result.attempts
    }
    errorMessage.value = result.error || t('error.auth.invalidCode')
    await nextTick()
    getInputs()[0]?.focus()
  }
}

async function handleResend() {
  if (!canResend.value || isSubmitting.value) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/auth/resend-code', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })

    const data = await response.json()

    if (response.ok) {
      timeRemaining.value = EXPIRY_SECONDS
      startExpiryTimer()
      digits.value = Array(CODE_LENGTH).fill('')
      attemptsRemaining.value = null
      startResendTimer(30)
      await nextTick()
      getInputs()[0]?.focus()
    } else if (data.waitSeconds) {
      startResendTimer(data.waitSeconds)
    } else {
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
          <p class="text-center text-body-2 font-weight-bold mb-4">
            {{ email }}
          </p>

          <div class="text-center mb-5">
            <p
              class="text-caption mb-1"
              :class="timerWarning ? 'text-warning timer-warning' : 'text-medium-emphasis'"
            >
              {{ t('verify.timerExpiring', { minutes: timerMinutes, seconds: timerSeconds }) }}
            </p>
            <v-progress-linear
              :model-value="timerProgress"
              height="4"
              rounded
              :color="timerWarning ? 'warning' : 'primary'"
            />
          </div>

          <v-alert
            v-if="errorMessage"
            type="error"
            class="mb-4"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>

          <v-alert
            v-if="attemptsRemaining !== null"
            type="warning"
            class="mb-4"
          >
            {{ t('verify.attemptsRemaining', { remaining: attemptsRemaining }) }}
          </v-alert>

          <form @submit.prevent="handleSubmit">
            <div class="code-boxes mb-6">
              <input
                v-for="(_, index) in digits"
                :key="index"
                v-model="digits[index]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="code-digit"
                :class="{ 'code-digit--error': errorMessage }"
                :disabled="isSubmitting"
                autocomplete="off"
                @input="handleInput(index)"
                @keydown="handleKeyDown(index, $event)"
                @paste="handlePaste"
              >
            </div>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="isSubmitting"
              :disabled="!isCodeComplete"
            >
              {{ t('verify.submit') }}
            </v-btn>
          </form>

          <v-divider class="my-4" />

          <p class="text-center text-caption text-medium-emphasis mb-1">
            {{ t('verify.noCode') }}
          </p>
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

          <v-btn
            variant="text"
            :to="localePath('/signin')"
            class="mt-4"
          >
            {{ t('verify.backToLogin') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped src="./VerifyCodeView.scss"></style>
