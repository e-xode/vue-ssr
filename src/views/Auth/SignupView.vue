<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  name: ''
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  const result = await authStore.signup({
    email: form.value.email,
    password: form.value.password,
    name: form.value.name
  })

  isSubmitting.value = false

  if (result.status === 'success') {
    await router.push('/auth/verify-code')
  } else {
    errorMessage.value = result.error || t('error.auth.signupFailed')
  }
}
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-center mb-6">{{ t('meta.signup.title') }}</v-card-title>

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
              v-model="form.name"
              :label="t('form.name')"
              type="text"
              class="mb-4"
              :disabled="isSubmitting"
              required
            />

            <v-text-field
              v-model="form.email"
              :label="t('form.email')"
              type="email"
              class="mb-4"
              :disabled="isSubmitting"
              required
            />

            <v-text-field
              v-model="form.password"
              :label="t('form.password')"
              :type="showPassword ? 'text' : 'password'"
              :append-icon="showPassword ? 'mdiEyeOff' : 'mdiEye'"
              @click:append="showPassword = !showPassword"
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
              {{ t('nav.signup') }}
            </v-btn>
          </v-form>

          <v-divider class="my-4" />

          <p class="text-center mb-0">
            {{ t('meta.signin.description') }}
            <router-link to="/signin" class="link">{{ t('nav.signin') }}</router-link>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.link {
  color: var(--v-primary-base);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
