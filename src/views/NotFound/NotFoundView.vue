<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <v-container class="fill-height">
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="6"
        lg="4"
        class="text-center"
      >
        <h1 class="text-h2 mb-4">
          404
        </h1>
        <p class="text-h6 mb-6">
          {{ t('meta.notFound.title') }}
        </p>
        <v-btn
          to="/"
          color="primary"
          variant="flat"
        >
          {{ t('nav.home') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
