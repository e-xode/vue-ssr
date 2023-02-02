<template>
    <div class="view-index">
        <h1>
            {{ $t('page.index.h1') }}
        </h1>
        <div class="buttons">
            <router-link
                class="vui-button vui-button--with-icon"
                :to="{ name: 'ViewLogin' }"
            >
                <span class="vui-button-holder">
                    <i class="vui-button-icon fa-solid fa-key" />
                    {{ $t('page.index.login') }}
                </span>
            </router-link>
            <router-link
                class="vui-button vui-button--with-icon"
                :to="{ name: 'ViewRegister' }"
            >
                <span class="vui-button-holder">
                    <i class="vui-button-icon fa-solid fa-list-check" />
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
