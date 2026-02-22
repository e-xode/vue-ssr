<script setup>
import { useI18n } from 'vue-i18n'
import {
  mdiServerNetwork,
  mdiShieldLock,
  mdiTranslate,
  mdiShieldAccount,
  mdiPalette,
  mdiSecurity,
  mdiGithub,
  mdiVuejs,
  mdiNodejs,
  mdiDatabase,
  mdiLanguageJavascript
} from '@mdi/js'

const { t } = useI18n()

const GITHUB_URL = 'https://github.com/e-xode/vue-ssr'

const features = [
  { key: 'ssr', icon: mdiServerNetwork, color: 'primary' },
  { key: 'auth', icon: mdiShieldLock, color: 'secondary' },
  { key: 'i18n', icon: mdiTranslate, color: 'info' },
  { key: 'admin', icon: mdiShieldAccount, color: 'warning' },
  { key: 'ui', icon: mdiPalette, color: 'success' },
  { key: 'security', icon: mdiSecurity, color: 'error' }
]

const stack = [
  { label: 'Vue 3', icon: mdiVuejs, color: '#42b883' },
  { label: 'Express', icon: mdiNodejs, color: '#339933' },
  { label: 'Vite SSR', icon: mdiLanguageJavascript, color: '#646cff' },
  { label: 'MongoDB', icon: mdiDatabase, color: '#47a248' },
  { label: 'Vuetify', icon: mdiPalette, color: '#1867c0' }
]
</script>

<template>
  <div class="index-page">
    <section class="hero">
      <v-container>
        <v-row justify="center" align="center">
          <v-col cols="12" md="9" lg="7" class="text-center">
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              class="mb-6"
            >
              {{ t('app.name') }}
            </v-chip>

            <h1 class="hero__title mb-4">{{ t('index.hero.title') }}</h1>

            <p class="hero__subtitle mb-4">{{ t('index.hero.subtitle') }}</p>

            <p class="hero__description mb-8">{{ t('index.hero.description') }}</p>

            <div class="d-flex gap-4 justify-center flex-wrap">
              <v-btn
                to="/signup"
                variant="flat"
                color="primary"
                size="large"
                rounded="lg"
              >
                {{ t('index.hero.cta.start') }}
              </v-btn>
              <v-btn
                :href="GITHUB_URL"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                color="primary"
                size="large"
                rounded="lg"
                :prepend-icon="mdiGithub"
                :aria-label="t('a11y.externalLink')"
              >
                {{ t('index.hero.cta.github') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="features py-16">
      <v-container>
        <v-row justify="center" class="mb-10">
          <v-col cols="12" class="text-center">
            <h2 class="text-h5 font-weight-bold">{{ t('index.features.title') }}</h2>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            v-for="feature in features"
            :key="feature.key"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card class="pa-5 h-100" border>
              <v-icon
                :icon="feature.icon"
                :color="feature.color"
                size="32"
                class="mb-3"
              />
              <div class="text-subtitle-1 font-weight-bold mb-2">
                {{ t(`index.features.${feature.key}.title`) }}
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t(`index.features.${feature.key}.description`) }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="stack py-12">
      <v-container>
        <v-row justify="center" class="mb-8">
          <v-col cols="12" class="text-center">
            <h2 class="text-h6 font-weight-bold text-medium-emphasis text-uppercase">
              {{ t('index.stack.title') }}
            </h2>
          </v-col>
        </v-row>
        <v-row justify="center" class="gap-2">
          <v-col
            v-for="item in stack"
            :key="item.label"
            cols="auto"
          >
            <v-chip
              variant="tonal"
              size="large"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon" :color="item.color" class="mr-1" />
              </template>
              {{ item.label }}
            </v-chip>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="opensource py-16">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="7" class="text-center">
            <v-icon :icon="mdiGithub" size="48" class="mb-4" />
            <h2 class="text-h5 font-weight-bold mb-3">{{ t('index.opensource.title') }}</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">{{ t('index.opensource.description') }}</p>
            <v-btn
              :href="GITHUB_URL"
              target="_blank"
              rel="noopener noreferrer"
              variant="flat"
              color="primary"
              size="large"
              rounded="lg"
              :prepend-icon="mdiGithub"
              :aria-label="t('a11y.externalLink')"
            >
              {{ t('index.opensource.cta') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
}

.hero {
  padding: 80px 0 64px;

  &__title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    line-height: 1.2;
  }

  &__subtitle {
    font-size: 1.25rem;
    font-weight: 500;
    opacity: 0.85;
  }

  &__description {
    font-size: 1rem;
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
    opacity: 0.7;
    line-height: 1.7;
  }
}

.features {
  background: rgba(var(--v-theme-surface-variant, 0 0 0), 0.03);
}

.opensource {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
