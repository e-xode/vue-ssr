<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '@/composables/useLocalePath'

const { t } = useI18n()
const { localePath } = useLocalePath()

const email = ref('')
const isSubmitting = ref(false)
const sent = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })

    if (response.ok) {
      sent.value = true
    } else {
      const data = await response.json()
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
            {{ t('forgotPassword.title') }}
          </v-card-title>

          <template v-if="sent">
            <v-alert
              type="success"
              class="mb-4"
            >
              {{ t('forgotPassword.sent') }}
            </v-alert>
            <p class="text-center text-body-2 text-medium-emphasis">
              {{ t('forgotPassword.sentHint') }}
            </p>
            <v-btn
              :to="localePath('/reset-password')"
              color="primary"
              block
              class="mt-4"
            >
              {{ t('forgotPassword.enterCode') }}
            </v-btn>
          </template>

          <template v-else>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ t('forgotPassword.description') }}
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
                v-model="email"
                :label="t('form.email')"
                type="email"
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
                {{ t('forgotPassword.submit') }}
              </v-btn>
            </v-form>

            <v-divider class="my-4" />

            <p class="text-center mb-0">
              <router-link
                :to="localePath('/signin')"
                class="link"
              >
                {{ t('nav.signin') }}
              </router-link>
            </p>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped src="./ForgotPasswordView.scss"></style>
