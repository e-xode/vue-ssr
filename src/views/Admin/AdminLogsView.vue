<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { mdiRefresh, mdiDelete } from '@mdi/js'

const { t } = useI18n()

const logs = ref([])
const total = ref(0)
const loading = ref(false)
const error = ref('')

const filters = ref({
  search: '',
  event: '',
  from: '',
  to: ''
})

const pagination = ref({ page: 1, perPage: 50 })
const eventTypes = ref([])
const selected = ref([])

const pageCount = computed(() => Math.ceil(total.value / pagination.value.perPage))

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}

async function fetchEvents() {
  try {
    const response = await fetch('/api/admin/logs/events', { credentials: 'include' })
    if (response.ok) {
      eventTypes.value = await response.json()
    }
  } catch {
    /* empty */
  }
}

async function fetchLogs() {
  loading.value = true
  error.value = ''
  selected.value = []
  try {
    const params = new URLSearchParams({
      page: pagination.value.page,
      perPage: pagination.value.perPage
    })
    if (filters.value.search) params.set('search', filters.value.search)
    if (filters.value.event) params.set('event', filters.value.event)
    if (filters.value.from) params.set('from', filters.value.from)
    if (filters.value.to) params.set('to', filters.value.to)

    const response = await fetch(`/api/admin/logs?${params}`, { credentials: 'include' })
    if (!response.ok) throw new Error('error.server')
    const data = await response.json()
    logs.value = data.logs
    total.value = data.total
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  pagination.value.page = 1
  fetchLogs()
}

function resetFilters() {
  filters.value = { search: '', event: '', from: '', to: '' }
  applyFilters()
}

async function deleteLog(id) {
  try {
    await fetch(`/api/admin/logs/${id}`, { method: 'DELETE', credentials: 'include' })
    fetchLogs()
  } catch {
    /* empty */
  }
}

async function deleteSelected() {
  if (!selected.value.length) return
  try {
    await fetch('/api/admin/logs', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected.value })
    })
    fetchLogs()
  } catch {
    /* empty */
  }
}

onMounted(() => {
  fetchEvents()
  fetchLogs()
})
</script>

<template>
  <v-container class="mt-6">
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h5 font-weight-bold">
            {{ t('admin.logs.title') }}
          </h1>
          <div class="d-flex gap-2">
            <v-btn
              v-if="selected.length"
              color="error"
              variant="tonal"
              :prepend-icon="mdiDelete"
              @click="deleteSelected"
            >
              {{ t('admin.logs.deleteSelected', { count: selected.length }) }}
            </v-btn>
            <v-btn
              :prepend-icon="mdiRefresh"
              variant="tonal"
              :loading="loading"
              @click="fetchLogs"
            >
              {{ t('form.loading') }}
            </v-btn>
          </div>
        </div>

        <v-card class="mb-4">
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="filters.search"
                  :label="t('admin.logs.search')"
                  clearable
                  @keyup.enter="applyFilters"
                />
              </v-col>
              <v-col
                cols="12"
                sm="3"
              >
                <v-select
                  v-model="filters.event"
                  :label="t('admin.logs.event')"
                  :items="['', ...eventTypes]"
                  clearable
                />
              </v-col>
              <v-col
                cols="12"
                sm="2"
              >
                <v-text-field
                  v-model="filters.from"
                  :label="t('admin.logs.from')"
                  type="date"
                />
              </v-col>
              <v-col
                cols="12"
                sm="2"
              >
                <v-text-field
                  v-model="filters.to"
                  :label="t('admin.logs.to')"
                  type="date"
                />
              </v-col>
              <v-col
                cols="12"
                sm="1"
                class="d-flex align-center gap-2"
              >
                <v-btn
                  color="primary"
                  @click="applyFilters"
                >
                  {{ t('form.submit') }}
                </v-btn>
              </v-col>
            </v-row>
            <v-btn
              variant="text"
              size="small"
              @click="resetFilters"
            >
              {{ t('admin.logs.reset') }}
            </v-btn>
          </v-card-text>
        </v-card>

        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
        >
          {{ error }}
        </v-alert>

        <p class="text-body-2 text-medium-emphasis mb-2">
          {{ total }} {{ t('admin.logs.total') }}
        </p>

        <v-table>
          <thead>
            <tr>
              <th class="w-5">
                <v-checkbox
                  :model-value="selected.length === logs.length && logs.length > 0"
                  :indeterminate="selected.length > 0 && selected.length < logs.length"
                  @change="selected = selected.length === logs.length ? [] : logs.map(l => l._id)"
                />
              </th>
              <th>{{ t('admin.logs.date') }}</th>
              <th>{{ t('admin.logs.event') }}</th>
              <th>{{ t('admin.logs.user') }}</th>
              <th>{{ t('admin.logs.ip') }}</th>
              <th>{{ t('admin.logs.meta') }}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-if="loading"
            >
              <td
                colspan="7"
                class="text-center py-8"
              >
                <v-progress-circular
                  indeterminate
                  color="primary"
                />
              </td>
            </tr>
            <tr
              v-else-if="!logs.length"
            >
              <td
                colspan="7"
                class="text-center py-8 text-medium-emphasis"
              >
                {{ t('admin.logs.empty') }}
              </td>
            </tr>
            <tr
              v-for="log in logs"
              v-else
              :key="log._id"
            >
              <td>
                <v-checkbox
                  v-model="selected"
                  :value="log._id"
                />
              </td>
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
                {{ log.user ? `${log.user.name} (${log.user.email})` : '—' }}
              </td>
              <td class="text-body-2">
                {{ log.ip || '—' }}
              </td>
              <td class="text-body-2">
                {{ log.meta && Object.keys(log.meta).length ? JSON.stringify(log.meta) : '—' }}
              </td>
              <td>
                <v-btn
                  :icon="mdiDelete"
                  variant="text"
                  color="error"
                  size="small"
                  @click="deleteLog(log._id)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>

        <div
          v-if="pageCount > 1"
          class="d-flex justify-center mt-4"
        >
          <v-pagination
            v-model="pagination.page"
            :length="pageCount"
            @update:model-value="fetchLogs"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
