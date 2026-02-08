<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.isAuthenticated && !authStore.loading) {
    await authStore.fetchUser()
    if (!authStore.isAuthenticated) {
      await router.push('/signin')
    }
  }
})
</script>

<template>
  <v-container v-if="authStore.isAuthenticated" class="mt-12">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-6">
          <v-card-title>{{ t('meta.dashboard.title') }}</v-card-title>
          <v-card-text>
            <p>{{ t('meta.dashboard.description') }}</p>
            <p class="mt-4">
              Welcome, <strong>{{ authStore.user?.name }}</strong>!
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
