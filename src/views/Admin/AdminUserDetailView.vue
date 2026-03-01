<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { mdiArrowLeft, mdiLock, mdiLockOpen } from '@mdi/js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const user = ref(null)
const recentLogs = ref([])
const loading = ref(false)
const saving = ref(false)
const blocking = ref(false)
const error = ref('')
const successMessage = ref('')

const form = ref({
  name: '',
  type: 'user'
})

const blockDialog = ref(false)
const blockIps = ref(false)

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
    recentLogs.value = data.recentLogs || []
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

async function blockUser() {
  blocking.value = true
  try {
    const response = await fetch(`/api/admin/users/${route.params.userId}/block`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockIps: blockIps.value })
    })
    if (response.ok) {
      user.value = { ...user.value, isBlocked: true }
      blockDialog.value = false
      successMessage.value = t('admin.users.blockSuccess')
    }
  } catch {
    /* empty */
  } finally {
    blocking.value = false
  }
}

async function unblockUser() {
  blocking.value = true
  try {
    const response = await fetch(`/api/admin/users/${route.params.userId}/unblock`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unblockIps: false })
    })
    if (response.ok) {
      user.value = { ...user.value, isBlocked: false }
      successMessage.value = t('admin.users.unblockSuccess')
    }
  } catch {
    /* empty */
  } finally {
    blocking.value = false
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

        <h1 class="text-h5 font-weight-bold mb-6">
          {{ t('admin.users.detailTitle') }}
        </h1>

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

        <div
          v-if="loading"
          class="text-center py-12"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <template v-else-if="user">
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-card class="mb-4">
                <v-card-title class="d-flex align-center justify-space-between">
                  {{ t('admin.users.info') }}
                  <v-chip
                    v-if="user.isBlocked"
                    color="error"
                    size="small"
                  >
                    {{ t('admin.users.blocked') }}
                  </v-chip>
                </v-card-title>
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
                    <v-list-item v-if="user.loginHistory?.length">
                      <v-list-item-subtitle>{{ t('admin.users.lastLogin') }}</v-list-item-subtitle>
                      <v-list-item-title>{{ formatDate(user.loginHistory[user.loginHistory.length - 1]?.date) }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    v-if="!user.isBlocked"
                    color="error"
                    variant="tonal"
                    :prepend-icon="mdiLock"
                    :loading="blocking"
                    @click="blockDialog = true"
                  >
                    {{ t('admin.users.block') }}
                  </v-btn>
                  <v-btn
                    v-else
                    color="success"
                    variant="tonal"
                    :prepend-icon="mdiLockOpen"
                    :loading="blocking"
                    @click="unblockUser"
                  >
                    {{ t('admin.users.unblock') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-card class="mb-4">
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

          <v-card
            v-if="recentLogs.length"
            class="mt-4"
          >
            <v-card-title>{{ t('admin.users.recentActivity') }}</v-card-title>
            <v-card-text>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>{{ t('admin.logs.date') }}</th>
                    <th>{{ t('admin.logs.event') }}</th>
                    <th>{{ t('admin.logs.ip') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="log in recentLogs"
                    :key="log._id"
                  >
                    <td class="text-body-2">
                      {{ formatDate(log.createdAt) }}
                    </td>
                    <td>
                      <v-chip
                        size="small"
                        variant="tonal"
                      >
                        {{ log.event }}
                      </v-chip>
                    </td>
                    <td class="text-body-2">
                      {{ log.ip || '—' }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </template>
      </v-col>
    </v-row>

    <v-dialog
      v-model="blockDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>{{ t('admin.users.blockConfirm.title') }}</v-card-title>
        <v-card-text>
          <p class="mb-4">
            {{ t('admin.users.blockConfirm.message') }}
          </p>
          <v-checkbox
            v-model="blockIps"
            :label="t('admin.users.blockConfirm.blockIps')"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="blockDialog = false"
          >
            {{ t('form.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            :loading="blocking"
            @click="blockUser"
          >
            {{ t('admin.users.block') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
