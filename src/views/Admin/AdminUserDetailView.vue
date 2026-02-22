<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { mdiArrowLeft } from '@mdi/js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const user = ref(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const successMessage = ref('')

const form = ref({
  name: '',
  type: 'user'
})

const typeOptions = [
  { value: 'user', title: 'User' },
  { value: 'admin', title: 'Admin' }
]

async function fetchUser() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`/api/admin/users/${route.params.userId}`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('error.server')
    const data = await response.json()
    user.value = data.user
    form.value.name = data.user.name
    form.value.type = data.user.type || 'user'
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  error.value = ''
  successMessage.value = ''
  try {
    const response = await fetch(`/api/admin/users/${route.params.userId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.value.name, type: form.value.type })
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'error.server')
    }
    const data = await response.json()
    user.value = data.user
    successMessage.value = t('admin.users.saveSuccess')
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}

onMounted(fetchUser)
</script>

<template>
  <v-container class="mt-6">
    <v-row>
      <v-col cols="12">
        <v-btn
          :prepend-icon="mdiArrowLeft"
          variant="text"
          class="mb-4"
          @click="router.push('/admin/users')"
        >
          {{ t('admin.users.backToList') }}
        </v-btn>

        <h1 class="text-h5 font-weight-bold mb-6">{{ t('admin.users.detailTitle') }}</h1>

        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          class="mb-4"
          closable
          @click:close="successMessage = ''"
        >
          {{ successMessage }}
        </v-alert>

        <div v-if="loading" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <template v-else-if="user">
          <v-row>
            <v-col cols="12" md="6">
              <v-card class="mb-4">
                <v-card-title>{{ t('admin.users.info') }}</v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-subtitle>{{ t('form.email') }}</v-list-item-subtitle>
                      <v-list-item-title>{{ user.email }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-subtitle>{{ t('admin.users.registered') }}</v-list-item-subtitle>
                      <v-list-item-title>{{ formatDate(user.createdAt) }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-subtitle>{{ t('admin.users.lastUpdate') }}</v-list-item-subtitle>
                      <v-list-item-title>{{ formatDate(user.updatedAt) }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card>
                <v-card-title>{{ t('admin.users.edit') }}</v-card-title>
                <v-card-text>
                  <v-form @submit.prevent="handleSave">
                    <v-text-field
                      v-model="form.name"
                      :label="t('form.name')"
                      class="mb-4"
                      :disabled="saving"
                    />
                    <v-select
                      v-model="form.type"
                      :label="t('admin.users.type')"
                      :items="typeOptions"
                      item-title="title"
                      item-value="value"
                      class="mb-4"
                      :disabled="saving"
                    />
                    <v-btn
                      type="submit"
                      color="primary"
                      block
                      :loading="saving"
                    >
                      {{ t('form.save') }}
                    </v-btn>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>
