<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { TheHeader, TheFooter } from '@/components/layout';
import CookieConsentBanner from '@/components/CookieConsent/CookieConsentBanner.vue';
import { useConsent } from '@/composables/useConsent';

const route = useRoute();
const { t } = useI18n();
const { getConsent, applyConsent } = useConsent();

const layout = computed(() => route.meta?.layout || 'public');
const showHeader = computed(() => layout.value !== 'minimal');
const showFooter = computed(() => layout.value === 'public');

onMounted(() => {
  const stored = getConsent();
  if (stored) applyConsent(stored);
});
</script>

<template>
  <v-app>
    <a href="#main-content" class="skip-link">{{ t('a11y.skipToContent') }}</a>

    <TheHeader v-if="showHeader" />

    <v-main id="main-content" role="main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <TheFooter v-if="showFooter" />

    <CookieConsentBanner />
  </v-app>
</template>

<style lang="scss" src="./App.scss"></style>
