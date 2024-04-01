<template>
    <div class="component-categories">
        <div class="categories">
            <router-link
                v-for="category in categories"
                :key="`category--${category._id}`"
                :to="{
                    name: 'ViewIndex',
                    query: {
                        category: category._id
                    },
                    params: {
                        locale
                    }
                }"
                class="category"
            >
                {{ category._id }}
            </router-link>
        </div>
    </div>
</template>

<script
    src="./categories.mjs"
/>

<style
    lang="scss"
    src="./categories.scss"
/>
