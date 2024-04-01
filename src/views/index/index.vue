<template>
    <div class="view-index">
        <ComponentCategories />
        <vui-loader
            v-if="isLoading"
            :text="$t('app.loading')"
        />
        <div
            v-if="!isLoading"
            class="items"
        >
            <router-link
                v-for="item in items"
                :key="`item--${item.id}`"
                :to="{
                    name: 'ViewItem',
                    params: {
                        locale,
                        collection: collection.name,
                        slug: item.slug
                    }
                }"
                :style="{
                    backgroundImage: `url(${item.files && item.files[0].path})`
                }"
                class="item"
            >
                <span class="label">
                    {{ item.name }}
                </span>
                <span class="price">
                    {{ item.price }}
                    {{ $t('app.currency') }}
                </span>
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
