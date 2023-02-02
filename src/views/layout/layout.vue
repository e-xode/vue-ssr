<template>
    <vui-page class="layout-default">
        <template #header>
            <vui-header>
                <router-link
                    :to="{ name: 'ViewIndex' }"
                    class="home"
                >
                    <i class="fa-solid fa-house" />
                    <span>
                        {{ $t('component.header.home') }}
                    </span>
                </router-link>
                <vui-dropdown
                    v-if="email"
                    item-label="label"
                    item-value="value"
                    :placeholder="email"
                    :items="[
                        {
                            icon: 'fa-solid fa-sliders',
                            label: $t('component.header.account'),
                            value: 'account'
                        },
                        {
                            icon: 'fa-solid fa-door-open',
                            label: $t('component.header.logout'),
                            value: 'logout'
                        }
                    ]"
                    @input="onDropdown"
                />
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
