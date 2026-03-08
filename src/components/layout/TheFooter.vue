<script setup>
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '@/composables/useLocalePath'

const { t } = useI18n()
const { localePath } = useLocalePath()
</script>

<template>
  <v-footer
    class="app-footer pa-0"
  >
    <v-container>
      <v-row
        density="comfortable"
        justify="center"
      >
        <v-col
          cols="12"
          class="text-center py-4"
        >
          <p class="mb-2">
            {{ t('footer.copyright') }}
          </p>
          <div class="footer-links">
            <router-link :to="localePath('/')">
              {{ t('nav.home') }}
            </router-link>
            <span class="mx-2">•</span>
            <router-link :to="localePath('/contact')">
              {{ t('nav.contact') }}
            </router-link>
            <span class="mx-2">•</span>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >{{ t('footer.privacy') }}</a>
            <span class="mx-2">•</span>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >{{ t('footer.terms') }}</a>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<style lang="scss" scoped src="./TheFooter.scss"></style>
