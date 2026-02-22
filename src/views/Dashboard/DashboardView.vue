<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { mdiShieldAccount } from '@mdi/js'

const { t } = useI18n()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
</script>

<template>
  <v-container class="mt-8">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold mb-2">
          {{ t('dashboard.welcome') }}, {{ user?.name }}
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-6">
          {{ t('dashboard.subtitle', { email: user?.email }) }}
        </p>
      </v-col>

      <v-col
        v-if="isAdmin"
        cols="12"
        md="4"
      >
        <v-card
          to="/admin/users"
          class="pa-4"
        >
          <div class="d-flex align-center gap-3">
            <v-icon
              :icon="mdiShieldAccount"
              color="primary"
              size="32"
            />
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ t('nav.admin') }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ t('admin.users.title') }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
