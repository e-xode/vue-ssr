<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocalePath } from '@/composables/useLocalePath'
import { useCaptcha } from '@/composables/useCaptcha'
import { mdiEye, mdiEyeOff } from '@mdi/js'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { localePath } = useLocalePath()
const { executeRecaptcha } = useCaptcha()

const form = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  const captchaToken = await executeRecaptcha('signin')

  const result = await authStore.signin({
    email: form.value.email,
    password: form.value.password,
    captchaToken
  })

  isSubmitting.value = false

  if (result.status === 'success') {
    const redirect = route.query.redirect
    await router.push({ path: localePath('/auth/verify-code'), query: redirect ? { redirect } : {} })
  } else {
    errorMessage.value = result.error || t('error.auth.signinFailed')
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
            {{ t('meta.signin.title') }}
          </v-card-title>

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
              v-model="form.email"
              :label="t('form.email')"
              type="email"
              autocomplete="email"
              class="mb-4"
              :disabled="isSubmitting"
              required
            />

            <v-text-field
              v-model="form.password"
              :label="t('form.password')"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
              autocomplete="current-password"
              class="mb-6"
              :disabled="isSubmitting"
              required
              @click:append="showPassword = !showPassword"
            />

            <div class="text-right mb-4">
              <router-link
                :to="localePath('/forgot-password')"
                class="text-primary text-caption"
              >
                {{ t('auth.signin.forgotPassword') }}
              </router-link>
            </div>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="isSubmitting"
            >
              {{ t('nav.signin') }}
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <p class="text-center mb-0">
            {{ t('meta.signup.description') }}
            <router-link
              :to="localePath('/signup')"
              class="link"
            >
              {{ t('nav.signup') }}
            </router-link>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped src="./SigninView.scss"></style>
