<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useLocalePath } from '@/composables/useLocalePath';
import { useCaptcha } from '@/composables/useCaptcha';
import AuthShell from '@/components/AuthShell.vue';
import { mdiEye, mdiEyeOff } from '@mdi/js';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { localePath } = useLocalePath();
const { executeRecaptcha } = useCaptcha();

const form = ref({
  email: '',
  password: '',
  name: '',
});

const showPassword = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

async function handleSubmit() {
  errorMessage.value = '';
  isSubmitting.value = true;

  const captchaToken = await executeRecaptcha('signup');

  const result = await authStore.signup({
    email: form.value.email,
    password: form.value.password,
    name: form.value.name,
    captchaToken,
  });

  isSubmitting.value = false;

  if (result.status === 'success') {
    await router.push(localePath('/auth/verify-code'));
  } else {
    errorMessage.value = result.error || t('error.auth.signupFailed');
  }
}
</script>

<template>
  <AuthShell>
    <v-card-title class="text-center mb-6">
      {{ t('meta.signup.title') }}
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
        v-model="form.name"
        :label="t('form.name')"
        type="text"
        autocomplete="name"
        class="mb-4"
        :disabled="isSubmitting"
        required
      />

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
        autocomplete="new-password"
        class="mb-6"
        :disabled="isSubmitting"
        required
        @click:append="showPassword = !showPassword"
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
      <router-link
        :to="localePath('/signin')"
        class="link"
      >
        {{ t('nav.signin') }}
      </router-link>
    </p>
  </AuthShell>
</template>
