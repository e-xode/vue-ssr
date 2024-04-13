<template>
    <vui-page class="layout-default">
        <template #header>
            <vui-header
                :class="{ 'vui-header--connected': isAuthenticated }"
            >
                <router-link
                    :to="{
                        name: 'ViewIndex',
                        params: {
                            locale
                        }
                    }"
                    class="home"
                >
                    <span>
                        {{ $t('component.header.home') }}
                    </span>
                </router-link>
                <vui-dropdown
                    v-if="isAuthenticated"
                    item-label="label"
                    item-value="value"
                    :items="dropdownItems"
                    :placeholder="email"
                    :value="email"
                    @update:model-value="onDropdown"
                />
                <router-link
                    v-if="!isAuthenticated"
                    :to="{
                        name: 'ViewLogin',
                        params: {
                            locale
                        }
                    }"
                    class="login"
                >
                    <i class="fa-solid fa-user-plus" />
                </router-link>
            </vui-header>
        </template>
        <template #body>
            <router-view />
        </template>
        <template #footer>
            <vui-footer>
                <span class="copyright">
                    <a href="https://ssr.e-xode.net">
                        {{ $t('page.layout.footer.copyright') }}
                    </a>
                </span>
            </vui-footer>
        </template>
    </vui-page>
</template>

<script
    src="./defaultLayout.mjs"
/>

<style
    lang="scss"
    src="./defaultLayout.scss"
/>
