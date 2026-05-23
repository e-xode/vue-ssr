<script setup>
import { useI18n } from 'vue-i18n';
import { useLocalePath } from '@/composables/useLocalePath';
import {
  mdiServerNetwork,
  mdiShieldLock,
  mdiTranslate,
  mdiShieldAccount,
  mdiPalette,
  mdiSecurity,
  mdiAccountCog,
  mdiFormatListChecks,
  mdiShieldCheck,
  mdiGithub,
  mdiVuejs,
  mdiNodejs,
  mdiDatabase,
  mdiLanguageJavascript,
} from '@mdi/js';

const { t } = useI18n();
const { localePath } = useLocalePath();

const GITHUB_URL = 'https://github.com/e-xode/vue-ssr';

const features = [
  { key: 'ssr', icon: mdiServerNetwork },
  { key: 'auth', icon: mdiShieldLock },
  { key: 'i18n', icon: mdiTranslate },
  { key: 'admin', icon: mdiShieldAccount },
  { key: 'ui', icon: mdiPalette },
  { key: 'security', icon: mdiSecurity },
  { key: 'account', icon: mdiAccountCog },
  { key: 'logging', icon: mdiFormatListChecks },
  { key: 'ipSecurity', icon: mdiShieldCheck },
];

const stack = [
  { label: 'Vue 3', icon: mdiVuejs },
  { label: 'Express', icon: mdiNodejs },
  { label: 'Vite SSR', icon: mdiLanguageJavascript },
  { label: 'MongoDB', icon: mdiDatabase },
  { label: 'Vuetify', icon: mdiPalette },
];
</script>

<template>
  <div class="index-page">
    <section class="hero">
      <v-container>
        <v-row
          justify="center"
          align="center"
        >
          <v-col
            cols="12"
            md="9"
            lg="7"
            class="text-center"
          >
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              class="mb-6"
            >
              {{ t('app.name') }}
            </v-chip>

            <h1 class="hero__title mb-4">
              {{ t('index.hero.title') }}
            </h1>

            <p class="hero__subtitle mb-4">
              {{ t('index.hero.subtitle') }}
            </p>

            <p class="hero__description mb-8">
              {{ t('index.hero.description') }}
            </p>

            <div class="d-flex ga-4 justify-center flex-wrap">
              <v-btn
                :to="localePath('/signup')"
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

    <section class="features">
      <v-container>
        <v-row
          justify="center"
          class="mb-10"
        >
          <v-col
            cols="12"
            md="8"
            class="text-center"
          >
            <h2 class="section-title">
              {{ t('index.features.title') }}
            </h2>
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
            <v-card class="feature-card h-100">
              <div class="feature-card__icon">
                <v-icon
                  :icon="feature.icon"
                  size="24"
                />
              </div>
              <h3 class="feature-card__title">
                {{ t(`index.features.${feature.key}.title`) }}
              </h3>
              <p class="feature-card__desc">
                {{ t(`index.features.${feature.key}.description`) }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="stack">
      <v-container>
        <v-row
          justify="center"
          class="mb-8"
        >
          <v-col
            cols="12"
            class="text-center"
          >
            <h2 class="section-eyebrow">
              {{ t('index.stack.title') }}
            </h2>
          </v-col>
        </v-row>
        <v-row
          justify="center"
          class="ga-3"
        >
          <v-col
            v-for="item in stack"
            :key="item.label"
            cols="auto"
          >
            <v-chip
              variant="tonal"
              size="large"
              class="stack__chip"
            >
              <template #prepend>
                <v-icon
                  :icon="item.icon"
                  class="mr-2"
                />
              </template>
              {{ item.label }}
            </v-chip>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="opensource">
      <v-container>
        <v-row justify="center">
          <v-col
            cols="12"
            md="7"
            class="text-center"
          >
            <v-icon
              :icon="mdiGithub"
              size="48"
              class="opensource__icon mb-4"
            />
            <h2 class="section-title mb-3">
              {{ t('index.opensource.title') }}
            </h2>
            <p class="opensource__description mb-6">
              {{ t('index.opensource.description') }}
            </p>
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

<style lang="scss" scoped src="./IndexView.scss"></style>
