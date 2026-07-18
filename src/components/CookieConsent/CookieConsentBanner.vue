<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConsent } from '@/composables/useConsent';

const { t } = useI18n();
const { setConsent, hasChoice } = useConsent();

const visible = ref(false);

onMounted(() => {
  visible.value = !hasChoice();
});

function accept() {
  setConsent('granted');
  visible.value = false;
}

function decline() {
  setConsent('denied');
  visible.value = false;
}
</script>

<template>
  <Transition name="cookie-consent">
    <div
      v-if="visible"
      class="cookie-consent"
      role="dialog"
      aria-modal="false"
      :aria-label="t('component.cookieConsent.title')"
    >
      <div class="cookie-consent__content">
        <h2 class="cookie-consent__title">
          {{ t('component.cookieConsent.title') }}
        </h2>
        <p class="cookie-consent__description">
          {{ t('component.cookieConsent.description') }}
        </p>
      </div>

      <div class="cookie-consent__actions">
        <v-btn
          variant="outlined"
          size="large"
          rounded="lg"
          class="cookie-consent__btn"
          @click="decline"
        >
          {{ t('component.cookieConsent.refuse') }}
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          size="large"
          rounded="lg"
          class="cookie-consent__btn"
          @click="accept"
        >
          {{ t('component.cookieConsent.accept') }}
        </v-btn>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped src="./CookieConsentBanner.scss"></style>
