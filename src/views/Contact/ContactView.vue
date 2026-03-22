<template>
  <v-container class="contact-page">
    <v-row justify="center">
      <v-col
        cols="12"
        md="8"
        lg="6"
      >
        <h1 class="text-display-small mb-2">
          {{ t('contact.title') }}
        </h1>
        <p class="text-body-large text-medium-emphasis mb-8">
          {{ t('contact.subtitle') }}
        </p>

        <v-alert
          v-if="success"
          type="success"
          class="mb-6"
        >
          {{ t('contact.success') }}
        </v-alert>

        <v-alert
          v-if="error"
          type="error"
          class="mb-6"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <v-form
          v-if="!success"
          @submit.prevent="handleSubmit"
        >
          <v-text-field
            v-model="form.name"
            :label="t('contact.name')"
            variant="outlined"
            required
            class="mb-4"
          />
          <v-text-field
            v-model="form.email"
            :label="t('contact.email')"
            type="email"
            variant="outlined"
            required
            class="mb-4"
          />
          <v-textarea
            v-model="form.message"
            :label="t('contact.message')"
            variant="outlined"
            rows="6"
            required
            class="mb-6"
          />
          <v-btn
            type="submit"
            color="primary"
            size="large"
            :loading="loading"
            :disabled="!isFormValid"
          >
            {{ t('contact.submit') }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/shared/api'
import { useCaptcha } from '@/composables/useCaptcha'

const { t, locale } = useI18n()
const { executeRecaptcha } = useCaptcha()

const form = ref({ name: '', email: '', message: '' })
const loading = ref(false)
const success = ref(false)
const error = ref('')

const isFormValid = computed(() =>
  form.value.name.trim() && form.value.email.trim() && form.value.message.trim()
)

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    const captchaToken = await executeRecaptcha('contact')

    await apiFetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ ...form.value, locale: locale.value, captchaToken })
    })
    success.value = true
  } catch (err) {
    error.value = err.isRateLimit ? t('error.tooManyRequests') : t('contact.error')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" src="./ContactView.scss"></style>
