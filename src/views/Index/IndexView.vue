<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <v-container class="mt-12">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-8 text-center">
          <v-card-title class="mb-4">{{ t('meta.index.title') }}</v-card-title>
          <v-card-text class="mb-6">
            {{ t('meta.index.description') }}
          </v-card-text>
          <div class="d-flex gap-2 justify-center">
            <v-btn
              to="/signin"
              variant="flat"
              color="primary"
            >
              {{ t('nav.signin') }}
            </v-btn>
            <v-btn
              to="/signup"
              variant="outlined"
              color="primary"
            >
              {{ t('nav.signup') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
