<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocalePath } from '@/composables/useLocalePath'
import { SUPPORTED_LOCALES } from '@/shared/const'
import {
  mdiAccount,
  mdiClose,
  mdiHome,
  mdiMenu,
  mdiShieldAccount,
  mdiLogout
} from '@mdi/js'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { locale, localePath, switchLocale } = useLocalePath()

const drawer = ref(false)
const scrolled = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)

function handleScroll() {
  scrolled.value = window.scrollY > 20
}

async function handleSignout() {
  await authStore.signout()
  await router.push(localePath('/signin'))
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
        :to="localePath('/')"
        class="app-header__logo mr-2"
        aria-label="Home"
      >
        <v-icon :icon="mdiHome" />
      </router-link>
      <router-link
        :to="localePath('/')"
        class="app-header__title"
      >
        {{ t('app.name') }}
      </router-link>

      <v-spacer />

      <div class="d-none d-md-flex align-center">
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
          <v-list density="compact">
            <v-list-item
              v-for="loc in SUPPORTED_LOCALES"
              :key="loc.code"
              :active="locale === loc.code"
              @click="switchLocale(loc.code)"
            >
              <v-list-item-title>{{ loc.label }}</v-list-item-title>
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
              <v-list-item :to="localePath('/dashboard')">
                <v-list-item-title>{{ t('nav.dashboard') }}</v-list-item-title>
              </v-list-item>
              <v-list-item :to="localePath('/account')">
                <v-list-item-title>{{ t('nav.account') }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="isAdmin"
                :to="localePath('/admin/users')"
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
            :to="localePath('/signin')"
            variant="text"
            size="small"
          >
            {{ t('nav.signin') }}
          </v-btn>
          <v-btn
            :to="localePath('/signup')"
            variant="flat"
            color="primary"
            size="small"
          >
            {{ t('nav.signup') }}
          </v-btn>
        </template>
      </div>

      <v-btn
        class="d-md-none"
        variant="text"
        :icon="drawer ? mdiClose : mdiMenu"
        :aria-label="drawer ? t('a11y.closeMenu') : t('a11y.openMenu')"
        @click="drawer = !drawer"
      />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer
    v-model="drawer"
    location="top"
    temporary
    class="app-mobile-nav"
  >
    <v-list class="pa-4">
      <v-list-item
        :to="localePath('/')"
        @click="drawer = false"
      >
        <v-list-item-title>{{ t('nav.home') }}</v-list-item-title>
      </v-list-item>
      <v-list-item
        :to="localePath('/contact')"
        @click="drawer = false"
      >
        <v-list-item-title>{{ t('nav.contact') }}</v-list-item-title>
      </v-list-item>

      <v-divider class="my-4" />

      <v-list-item>
        <v-list-item-title class="text-uppercase font-weight-bold mb-2">
          {{ t('nav.language') }}
        </v-list-item-title>
        <div class="d-flex ga-2">
          <v-btn
            v-for="loc in SUPPORTED_LOCALES"
            :key="loc.code"
            variant="flat"
            :color="locale === loc.code ? 'primary' : 'default'"
            size="small"
            @click="switchLocale(loc.code)"
          >
            {{ loc.code.toUpperCase() }}
          </v-btn>
        </div>
      </v-list-item>

      <v-divider class="my-4" />

      <template v-if="isAuthenticated">
        <v-list-item
          :to="localePath('/dashboard')"
          @click="drawer = false"
        >
          <v-list-item-title>{{ t('nav.dashboard') }}</v-list-item-title>
        </v-list-item>
        <v-list-item
          :to="localePath('/account')"
          @click="drawer = false"
        >
          <v-list-item-title>{{ t('nav.account') }}</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="isAdmin"
          :to="localePath('/admin/users')"
          @click="drawer = false"
        >
          <template #prepend>
            <v-icon :icon="mdiShieldAccount" />
          </template>
          <v-list-item-title>{{ t('nav.admin') }}</v-list-item-title>
        </v-list-item>
        <v-divider class="my-2" />
        <v-list-item @click="handleSignout">
          <template #prepend>
            <v-icon :icon="mdiLogout" />
          </template>
          <v-list-item-title>{{ t('nav.signout') }}</v-list-item-title>
        </v-list-item>
      </template>
      <template v-else>
        <v-list-item
          :to="localePath('/signin')"
          @click="drawer = false"
        >
          <v-list-item-title>{{ t('nav.signin') }}</v-list-item-title>
        </v-list-item>
        <v-list-item class="mt-2">
          <v-btn
            block
            color="primary"
            :to="localePath('/signup')"
            @click="drawer = false"
          >
            {{ t('nav.signup') }}
          </v-btn>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<style lang="scss" src="./TheHeader.scss"></style>
