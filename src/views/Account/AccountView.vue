<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiCamera, mdiDelete } from '@mdi/js'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const tab = ref('profile')

const avatarInput = ref(null)
const avatarLoading = ref(false)
const avatarError = ref('')

const profileForm = ref({ name: authStore.user?.name || '' })
const profileSaving = ref(false)
const profileSuccess = ref('')
const profileError = ref('')

const emailForm = ref({ newEmail: '', code: '' })
const emailStep = ref(1)
const emailSaving = ref(false)
const emailSuccess = ref('')
const emailError = ref('')

const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const showPassword = ref(false)
const passwordSaving = ref(false)
const passwordSuccess = ref('')
const passwordError = ref('')

async function uploadAvatar(event) {
  const file = event.target.files?.[0]
  if (!file) return
  avatarError.value = ''
  avatarLoading.value = true
  try {
    const form = new FormData()
    form.append('avatar', file)
    const response = await fetch('/api/auth/avatar', {
      method: 'POST',
      credentials: 'include',
      body: form
    })
    const data = await response.json()
    if (response.ok) {
      authStore.updateUser({ avatar: data.avatar })
    } else {
      avatarError.value = t(data.error) || t('error.server')
    }
  } catch {
    avatarError.value = t('error.server')
  } finally {
    avatarLoading.value = false
    if (avatarInput.value) avatarInput.value.value = ''
  }
}

async function deleteAvatar() {
  avatarError.value = ''
  avatarLoading.value = true
  try {
    const response = await fetch('/api/auth/avatar', {
      method: 'DELETE',
      credentials: 'include'
    })
    if (response.ok) {
      authStore.updateUser({ avatar: null })
    } else {
      const data = await response.json()
      avatarError.value = t(data.error) || t('error.server')
    }
  } catch {
    avatarError.value = t('error.server')
  } finally {
    avatarLoading.value = false
  }
}

async function saveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  profileSaving.value = true
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profileForm.value.name })
    })
    const data = await response.json()
    if (response.ok) {
      authStore.updateUser({ name: profileForm.value.name })
      profileSuccess.value = t('account.profile.saveSuccess')
    } else {
      profileError.value = t(data.error) || t('error.server')
    }
  } catch {
    profileError.value = t('error.server')
  } finally {
    profileSaving.value = false
  }
}

async function requestEmailChange() {
  emailError.value = ''
  emailSaving.value = true
  try {
    const response = await fetch('/api/auth/change-email', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail: emailForm.value.newEmail })
    })
    const data = await response.json()
    if (response.ok) {
      emailStep.value = 2
    } else {
      emailError.value = t(data.error) || t('error.server')
    }
  } catch {
    emailError.value = t('error.server')
  } finally {
    emailSaving.value = false
  }
}

async function verifyEmailChange() {
  emailError.value = ''
  emailSaving.value = true
  try {
    const response = await fetch('/api/auth/verify-email-change', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: emailForm.value.code })
    })
    const data = await response.json()
    if (response.ok) {
      authStore.updateUser({ email: data.email })
      emailSuccess.value = t('account.email.changeSuccess')
      emailStep.value = 1
      emailForm.value = { newEmail: '', code: '' }
    } else {
      emailError.value = t(data.error) || t('error.server')
    }
  } catch {
    emailError.value = t('error.server')
  } finally {
    emailSaving.value = false
  }
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = t('error.auth.passwordsDoNotMatch')
    return
  }
  passwordError.value = ''
  passwordSuccess.value = ''
  passwordSaving.value = true
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })
    })
    const data = await response.json()
    if (response.ok) {
      passwordSuccess.value = t('account.password.changeSuccess')
      passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    } else {
      passwordError.value = t(data.error) || t('error.server')
    }
  } catch {
    passwordError.value = t('error.server')
  } finally {
    passwordSaving.value = false
  }
}
</script>

<template>
  <v-container class="mt-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold mb-6">
          {{ t('account.title') }}
        </h1>

        <v-tabs
          v-model="tab"
          class="mb-6"
        >
          <v-tab value="profile">
            {{ t('account.tabs.profile') }}
          </v-tab>
          <v-tab value="email">
            {{ t('account.tabs.email') }}
          </v-tab>
          <v-tab value="password">
            {{ t('account.tabs.password') }}
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="profile">
            <v-card max-width="500">
              <v-card-title>{{ t('account.profile.title') }}</v-card-title>
              <v-card-text>
                <div class="d-flex align-center gap-4 mb-6">
                  <v-avatar
                    size="72"
                    color="primary"
                  >
                    <v-img
                      v-if="authStore.user?.avatar"
                      :src="authStore.user.avatar"
                      :alt="authStore.user?.name"
                    />
                    <span
                      v-else
                      class="text-h6"
                    >
                      {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
                    </span>
                  </v-avatar>
                  <div class="d-flex gap-2">
                    <v-btn
                      :prepend-icon="mdiCamera"
                      size="small"
                      variant="tonal"
                      :loading="avatarLoading"
                      @click="avatarInput?.click()"
                    >
                      {{ t('account.avatar.upload') }}
                    </v-btn>
                    <v-btn
                      v-if="authStore.user?.avatar"
                      :icon="mdiDelete"
                      size="small"
                      variant="text"
                      color="error"
                      :loading="avatarLoading"
                      @click="deleteAvatar"
                    />
                    <input
                      ref="avatarInput"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      class="d-none"
                      @change="uploadAvatar"
                    >
                  </div>
                </div>

                <v-alert
                  v-if="avatarError"
                  type="error"
                  class="mb-4"
                  closable
                  @click:close="avatarError = ''"
                >
                  {{ avatarError }}
                </v-alert>

                <v-alert
                  v-if="profileError"
                  type="error"
                  class="mb-4"
                  closable
                  @click:close="profileError = ''"
                >
                  {{ profileError }}
                </v-alert>
                <v-alert
                  v-if="profileSuccess"
                  type="success"
                  class="mb-4"
                  closable
                  @click:close="profileSuccess = ''"
                >
                  {{ profileSuccess }}
                </v-alert>
                <v-form @submit.prevent="saveProfile">
                  <v-text-field
                    v-model="profileForm.name"
                    :label="t('form.name')"
                    class="mb-4"
                    :disabled="profileSaving"
                    required
                  />
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="profileSaving"
                  >
                    {{ t('form.save') }}
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="email">
            <v-card max-width="500">
              <v-card-title>{{ t('account.email.title') }}</v-card-title>
              <v-card-text>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  {{ t('account.email.current') }}: <strong>{{ authStore.user?.email }}</strong>
                </p>

                <v-alert
                  v-if="emailError"
                  type="error"
                  class="mb-4"
                  closable
                  @click:close="emailError = ''"
                >
                  {{ emailError }}
                </v-alert>
                <v-alert
                  v-if="emailSuccess"
                  type="success"
                  class="mb-4"
                  closable
                  @click:close="emailSuccess = ''"
                >
                  {{ emailSuccess }}
                </v-alert>

                <v-form
                  v-if="emailStep === 1"
                  @submit.prevent="requestEmailChange"
                >
                  <v-text-field
                    v-model="emailForm.newEmail"
                    :label="t('account.email.new')"
                    type="email"
                    class="mb-4"
                    :disabled="emailSaving"
                    required
                  />
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="emailSaving"
                  >
                    {{ t('account.email.sendCode') }}
                  </v-btn>
                </v-form>

                <v-form
                  v-else
                  @submit.prevent="verifyEmailChange"
                >
                  <p class="text-body-2 mb-4">
                    {{ t('account.email.codeSent', { email: emailForm.newEmail }) }}
                  </p>
                  <v-text-field
                    v-model="emailForm.code"
                    :label="t('form.code')"
                    class="mb-4"
                    :disabled="emailSaving"
                    required
                  />
                  <div class="d-flex gap-2">
                    <v-btn
                      type="submit"
                      color="primary"
                      :loading="emailSaving"
                    >
                      {{ t('form.submit') }}
                    </v-btn>
                    <v-btn
                      variant="text"
                      :disabled="emailSaving"
                      @click="emailStep = 1"
                    >
                      {{ t('form.cancel') }}
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="password">
            <v-card max-width="500">
              <v-card-title>{{ t('account.password.title') }}</v-card-title>
              <v-card-text>
                <v-alert
                  v-if="passwordError"
                  type="error"
                  class="mb-4"
                  closable
                  @click:close="passwordError = ''"
                >
                  {{ passwordError }}
                </v-alert>
                <v-alert
                  v-if="passwordSuccess"
                  type="success"
                  class="mb-4"
                  closable
                  @click:close="passwordSuccess = ''"
                >
                  {{ passwordSuccess }}
                </v-alert>
                <v-form @submit.prevent="changePassword">
                  <v-text-field
                    v-model="passwordForm.currentPassword"
                    :label="t('form.currentPassword')"
                    :type="showPassword ? 'text' : 'password'"
                    class="mb-4"
                    :disabled="passwordSaving"
                    required
                  />
                  <v-text-field
                    v-model="passwordForm.newPassword"
                    :label="t('form.newPassword')"
                    :type="showPassword ? 'text' : 'password'"
                    class="mb-4"
                    :disabled="passwordSaving"
                    required
                  />
                  <v-text-field
                    v-model="passwordForm.confirmPassword"
                    :label="t('form.confirmPassword')"
                    :type="showPassword ? 'text' : 'password'"
                    class="mb-4"
                    :disabled="passwordSaving"
                    required
                  />
                  <v-checkbox
                    v-model="showPassword"
                    :label="t('form.showPassword')"
                    class="mb-4"
                  />
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="passwordSaving"
                  >
                    {{ t('account.password.submit') }}
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>
