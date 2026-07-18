<script setup></script>

<template>
  <v-container class="auth-shell fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="auth-shell__card pa-6">
          <slot />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped src="./AuthShell.scss"></style>
