<template>
    <vui-page class="layout-default">
        <template #header>
            <vui-header>
                <router-link
                    :to="{ name: 'ViewIndex' }"
                    class="home"
                >
                    {{ $t('component.header.home') }}
                </router-link>
            </vui-header>
        </template>
        <template #body>
            <router-view />
        </template>
        <template #footer>
            <vui-footer>
                <span class="copyright">
                    <a href="https://www.e-xode.net">
                        www.e-xode.net
                    </a>
                </span>
            </vui-footer>
        </template>
    </vui-page>
</template>

<script
    src="./layout.mjs"
/>

<style
    lang="scss"
    src="./layout.scss"
/>
