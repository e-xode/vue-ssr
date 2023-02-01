<template>
    <div class="view-index">
        <h1>
            {{ $t('page.index.h1') }}
        </h1>
        <div class="links">
            <router-link
                class="vui-button vui-button--default"
                :to="{ name: 'ViewLogin' }"
            >
                <span class="vui-button-holder">
                    {{ $t('page.index.login') }}
                </span>
            </router-link>
            <router-link
                class="vui-button vui-button--default"
                :to="{ name: 'ViewRegister' }"
            >
                <span class="vui-button-holder">
                    {{ $t('page.index.register') }}
                </span>
            </router-link>
        </div>
        <p>
            {{ $t('page.index.welcome') }}
            <a
                href="https://github.com/e-xode/vue-ssr"
                target="_blank"
            >
                {{ $t('page.index.github-link') }}
            </a>
        </p>
    </div>
</template>

<script
    src="./index.mjs"
/>

<style
    lang="scss"
    src="./index.scss"
/>
