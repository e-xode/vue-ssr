<template>
    <div class="view-index">
        <h1>
            {{ $t('page.index.h1') }}
        </h1>
        <div class="links">
            <router-link :to="{ name: 'ViewLogin' }">
                {{ $t('page.index.login') }}
            </router-link>
            <router-link :to="{ name: 'ViewRegister' }">
                {{ $t('page.index.register') }}
            </router-link>
        </div>
    </div>
</template>

<script
    src="./index.mjs"
/>

<style
    lang="scss"
    src="./index.scss"
/>
