<script setup>
import { useI18n } from 'vue-i18n';
import { useLocalePath } from '@/composables/useLocalePath';

const { t } = useI18n();
const { localePath } = useLocalePath();
</script>

<template>
  <v-container class="fill-height not-found">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
        <p class="not-found__code mb-2">404</p>
        <h1 class="not-found__title mb-3">
          {{ t('meta.notFound.title') }}
        </h1>
        <p class="not-found__subtitle mb-8">
          {{ t('meta.notFound.subtitle') }}
        </p>
        <v-btn :to="localePath('/')" color="primary" variant="flat">
          {{ t('nav.home') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped src="./NotFoundView.scss"></style>
