<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  mdiAccount,
  mdiShieldAccount,
  mdiLogout
} from '@mdi/js'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const scrolled = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

function setLanguage(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

async function handleSignout() {
  await authStore.signout()
  await router.push('/signin')
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <v-app-bar
    :elevation="scrolled ? 2 : 0"
    class="app-header"
    height="72"
  >
    <v-container class="d-flex align-center">
      <router-link
        to="/"
        class="app-header__logo mr-2"
        aria-label="Home"
      >
        <v-icon icon="mdiHome" />
      </router-link>
      <router-link
        to="/"
        class="app-header__title"
      >
        {{ t('app.name') }}
      </router-link>

      <v-spacer />

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            :aria-label="t('a11y.languageSelector')"
          >
            {{ locale.toUpperCase() }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            :active="locale === 'en'"
            @click="setLanguage('en')"
          >
            <v-list-item-title>English</v-list-item-title>
          </v-list-item>
          <v-list-item
            :active="locale === 'fr'"
            @click="setLanguage('fr')"
          >
            <v-list-item-title>Français</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <template v-if="isAuthenticated">
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :icon="mdiAccount"
              :aria-label="t('a11y.userMenu')"
            />
          </template>
          <v-list>
            <v-list-item to="/dashboard">
              <v-list-item-title>{{ t('nav.dashboard') }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="isAdmin"
              to="/admin/users"
            >
              <template #prepend>
                <v-icon :icon="mdiShieldAccount" />
              </template>
              <v-list-item-title>{{ t('nav.admin') }}</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="handleSignout">
              <template #prepend>
                <v-icon :icon="mdiLogout" />
              </template>
              <v-list-item-title>{{ t('nav.signout') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-else>
        <v-btn
          to="/signin"
          variant="text"
          size="small"
        >
          {{ t('nav.signin') }}
        </v-btn>
        <v-btn
          to="/signup"
          variant="flat"
          color="primary"
          size="small"
        >
          {{ t('nav.signup') }}
        </v-btn>
      </template>
    </v-container>
  </v-app-bar>
</template>

<style lang="scss" scoped>
.app-header {
  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--v-primary-base);
    color: white;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    text-decoration: none;
    color: var(--v-on-background-base);
    transition: color 0.2s ease;

    &:hover {
      color: var(--v-primary-base);
    }
  }
}
</style>
