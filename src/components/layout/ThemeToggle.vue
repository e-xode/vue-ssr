<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';
import { THEME_COOKIE, THEME_COOKIE_MAX_AGE } from '@/shared/theme';

const theme = useTheme();
const { t } = useI18n();

const isDark = computed(() => theme.global.current.value.dark);
const icon = computed(() => (isDark.value ? mdiWeatherSunny : mdiWeatherNight));

const toggle = () => {
  const next = isDark.value ? 'light' : 'dark';
  theme.change(next);
  if (typeof document !== 'undefined') {
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
    document.documentElement.classList.remove('v-theme--light', 'v-theme--dark');
    document.documentElement.classList.add(`v-theme--${next}`);
  }
};
</script>

<template>
  <v-btn
    :icon="icon"
    variant="text"
    :aria-label="t('a11y.toggleTheme')"
    @click="toggle"
  />
</template>
