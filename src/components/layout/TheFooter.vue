<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <v-footer
    class="app-footer"
    padless
  >
    <v-container>
      <v-row dense justify="center">
        <v-col cols="12" class="text-center py-4">
          <p class="mb-2">{{ t('footer.copyright') }}</p>
          <div class="footer-links">
            <router-link to="/">{{ t('nav.home') }}</router-link>
            <span class="mx-2">•</span>
            <a href="#" target="_blank" rel="noopener noreferrer">{{ t('footer.privacy') }}</a>
            <span class="mx-2">•</span>
            <a href="#" target="_blank" rel="noopener noreferrer">{{ t('footer.terms') }}</a>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<style lang="scss" scoped>
.app-footer {
  background: var(--v-background-base);
  border-top: 1px solid var(--v-border-color, #e5e7eb);
  margin-top: auto;

  p {
    margin: 0;
    font-size: 14px;
    color: var(--v-on-background-base);
  }
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;

  a {
    color: var(--v-primary-base);
    text-decoration: none;
    font-size: 14px;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
