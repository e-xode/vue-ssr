<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { mdiMagnify, mdiPencil, mdiDelete, mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const { t } = useI18n()
const router = useRouter()

const users = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(25)
const search = ref('')
const loading = ref(false)
const error = ref('')
const deleteDialog = ref(false)
const userToDelete = ref(null)
const deleteLoading = ref(false)

const totalPages = ref(1)

async function fetchUsers() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams({
      page: page.value,
      limit: limit.value,
      ...(search.value ? { search: search.value } : {})
    })
    const response = await fetch(`/api/admin/users?${params}`, { credentials: 'include' })
    if (!response.ok) throw new Error('error.server')
    const data = await response.json()
    users.value = data.users
    total.value = data.total
    totalPages.value = Math.ceil(data.total / limit.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchUsers()
}

function goToPage(p) {
  page.value = p
  fetchUsers()
}

function confirmDelete(user) {
  userToDelete.value = user
  deleteDialog.value = true
}

async function executeDelete() {
  if (!userToDelete.value) return
  deleteLoading.value = true
  try {
    const response = await fetch(`/api/admin/users/${userToDelete.value._id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'error.server')
    }
    deleteDialog.value = false
    userToDelete.value = null
    await fetchUsers()
  } catch (e) {
    error.value = e.message
  } finally {
    deleteLoading.value = false
  }
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}

onMounted(fetchUsers)
</script>

<template>
  <v-container class="mt-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <h1 class="text-h5 font-weight-bold">
            {{ t('admin.users.title') }}
          </h1>
          <v-spacer />
          <span class="text-body-2 text-medium-emphasis">{{ total }} {{ t('admin.users.total') }}</span>
        </div>

        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <v-card>
          <v-card-text class="pb-0">
            <v-text-field
              v-model="search"
              :label="t('admin.users.search')"
              :prepend-inner-icon="mdiMagnify"
              clearable
              hide-details
              class="mb-4"
              @update:model-value="handleSearch"
            />
          </v-card-text>

          <v-table>
            <thead>
              <tr>
                <th>{{ t('form.name') }}</th>
                <th>{{ t('form.email') }}</th>
                <th>{{ t('admin.users.type') }}</th>
                <th>{{ t('admin.users.registered') }}</th>
                <th class="text-right">
                  {{ t('admin.users.actions') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td
                  colspan="5"
                  class="text-center py-8"
                >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  />
                </td>
              </tr>
              <tr v-else-if="!users.length">
                <td
                  colspan="5"
                  class="text-center py-8 text-medium-emphasis"
                >
                  {{ t('admin.users.empty') }}
                </td>
              </tr>
              <tr
                v-for="user in users"
                v-else
                :key="user._id"
              >
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <v-chip
                    :color="user.type === 'admin' ? 'primary' : 'default'"
                    size="small"
                    variant="tonal"
                  >
                    {{ user.type }}
                  </v-chip>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td class="text-right">
                  <v-btn
                    :icon="mdiPencil"
                    size="small"
                    variant="text"
                    @click="router.push(`/admin/users/${user._id}`)"
                  />
                  <v-btn
                    :icon="mdiDelete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="confirmDelete(user)"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-card-text
            v-if="totalPages > 1"
            class="d-flex align-center justify-center gap-2 pt-4"
          >
            <v-btn
              :icon="mdiChevronLeft"
              :disabled="page === 1"
              size="small"
              variant="text"
              @click="goToPage(page - 1)"
            />
            <span class="text-body-2">{{ page }} / {{ totalPages }}</span>
            <v-btn
              :icon="mdiChevronRight"
              :disabled="page === totalPages"
              size="small"
              variant="text"
              @click="goToPage(page + 1)"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>{{ t('admin.users.deleteConfirm.title') }}</v-card-title>
        <v-card-text>
          {{ t('admin.users.deleteConfirm.message', { name: userToDelete?.name }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="deleteDialog = false"
          >
            {{ t('form.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            :loading="deleteLoading"
            @click="executeDelete"
          >
            {{ t('form.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
