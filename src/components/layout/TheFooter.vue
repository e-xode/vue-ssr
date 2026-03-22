<script setup>
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '@/composables/useLocalePath'
import { mdiHome } from '@mdi/js'

const { t } = useI18n()
const { localePath } = useLocalePath()
const currentYear = new Date().getFullYear()
const appVersion = __APP_VERSION__
</script>

<template>
  <v-footer
    class="app-footer pa-0"
  >
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="4"
          class="app-footer__brand"
        >
          <router-link
            :to="localePath('/')"
            class="app-footer__logo"
          >
            <v-icon :icon="mdiHome" />
            <span>{{ t('app.name') }}</span>
          </router-link>
          <p class="app-footer__description">
            {{ t('footer.description') }}
          </p>
        </v-col>

        <v-col
          cols="6"
          md="4"
        >
          <h4 class="app-footer__title">
            {{ t('footer.links') }}
          </h4>
          <ul class="app-footer__links">
            <li>
              <router-link :to="localePath('/')">
                {{ t('nav.home') }}
              </router-link>
            </li>
            <li>
              <router-link :to="localePath('/contact')">
                {{ t('nav.contact') }}
              </router-link>
            </li>
            <li>
              <router-link :to="localePath('/dashboard')">
                {{ t('nav.dashboard') }}
              </router-link>
            </li>
          </ul>
        </v-col>

        <v-col
          cols="6"
          md="4"
        >
          <h4 class="app-footer__title">
            {{ t('footer.legal') }}
          </h4>
          <ul class="app-footer__links">
            <li>
              <router-link :to="localePath('/privacy')">
                {{ t('footer.privacy') }}
              </router-link>
            </li>
            <li>
              <router-link :to="localePath('/terms')">
                {{ t('footer.terms') }}
              </router-link>
            </li>
          </ul>
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <v-row
        class="app-footer__bottom"
        align="center"
      >
        <v-col
          cols="12"
          md="6"
          class="text-center text-md-start"
        >
          <p>{{ t('footer.copyright', { year: currentYear }) }}</p>
        </v-col>
        <v-col
          cols="12"
          md="6"
          class="text-center text-md-end"
        >
          <p>v{{ appVersion }}</p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<style lang="scss" scoped src="./TheFooter.scss"></style>
