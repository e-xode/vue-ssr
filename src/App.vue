<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { TheHeader, TheFooter } from '@/components/layout'

const route = useRoute()
const { t } = useI18n()

const layout = computed(() => route.meta?.layout || 'public')
const showHeader = computed(() => layout.value !== 'minimal')
const showFooter = computed(() => layout.value === 'public')
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
    </v-app>
</template>

<style lang="scss">
@import './App.scss';

.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #2563eb;
    color: white;
    padding: 8px 16px;
    z-index: 9999;

    &:focus {
        top: 0;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
