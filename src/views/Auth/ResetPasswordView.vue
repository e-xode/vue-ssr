<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useLocalePath } from '@/composables/useLocalePath'

const { t } = useI18n()
const router = useRouter()
const { localePath } = useLocalePath()

const form = ref({
  email: '',
  code: '',
  password: '',
  passwordConfirm: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  if (form.value.password !== form.value.passwordConfirm) {
    errorMessage.value = t('resetPassword.passwordMismatch')
    return
  }

  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.value.email,
        code: form.value.code,
        password: form.value.password
      })
    })

    const data = await response.json()

    if (response.ok) {
      await router.push(localePath('/signin'))
    } else {
      errorMessage.value = data.error || t('error.server')
    }
  } catch {
    errorMessage.value = t('error.server')
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
          <v-card-title class="text-center mb-6">
            {{ t('resetPassword.title') }}
          </v-card-title>

          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ t('resetPassword.description') }}
          </p>

          <v-alert
            v-if="errorMessage"
            type="error"
            class="mb-4"
            closable
          >
            {{ t(errorMessage) }}
          </v-alert>

          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="form.email"
              :label="t('form.email')"
              type="email"
              class="mb-4"
              :disabled="isSubmitting"
              required
            />

            <v-text-field
              v-model="form.code"
              :label="t('form.code')"
              class="mb-4"
              :disabled="isSubmitting"
              required
            />

            <v-text-field
              v-model="form.password"
              :label="t('form.newPassword')"
              :type="showPassword ? 'text' : 'password'"
              class="mb-4"
              :disabled="isSubmitting"
              required
              @click:append="showPassword = !showPassword"
            />

            <v-text-field
              v-model="form.passwordConfirm"
              :label="t('form.confirmPassword')"
              :type="showPassword ? 'text' : 'password'"
              class="mb-6"
              :disabled="isSubmitting"
              required
            />

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="isSubmitting"
            >
              {{ t('resetPassword.submit') }}
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <p class="text-center mb-0">
            <router-link
              :to="localePath('/forgot-password')"
              class="link"
            >
              {{ t('forgotPassword.resend') }}
            </router-link>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped src="./ResetPasswordView.scss"></style>
