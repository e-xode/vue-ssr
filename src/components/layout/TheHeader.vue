<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import {
  mdiMenu,
  mdiClose,
  mdiAccount,
  mdiLogout
} from '@mdi/js'

const { t, locale } = useI18n()
const authStore = useAuthStore()

const drawer = ref(false)
const scrolled = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const navLinks = computed(() => [
  { title: t('nav.home'), to: '/' },
  { title: t('nav.dashboard'), to: '/dashboard' }
].filter(link => {
  if (link.to === '/' && isAuthenticated.value) return false
  if (link.to === '/dashboard' && !isAuthenticated.value) return false
  return true
}))

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

function setLanguage(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

async function handleSignout() {
  await authStore.signout()
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
        <template v-slot:activator="{ props }">
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
            @click="setLanguage('en')"
            :active="locale === 'en'"
          >
            <v-list-item-title>English</v-list-item-title>
          </v-list-item>
          <v-list-item
            @click="setLanguage('fr')"
            :active="locale === 'fr'"
          >
            <v-list-item-title>Français</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <template v-if="isAuthenticated">
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              :icon="mdiAccount"
              :aria-label="t('a11y.userMenu')"
            />
          </template>
          <v-list>
            <v-list-item to="/dashboard">
              <v-list-item-title>{{ t('nav.dashboard') }}</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="handleSignout">
              <template v-slot:prepend>
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
