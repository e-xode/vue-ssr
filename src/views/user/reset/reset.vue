<template>
    <vui-card
        flat
        class="view-reset"
    >
        <h1>
            <i class="fa-solid fa-key" />
            {{ $t('page.reset-password.h1') }}
        </h1>
        <vui-form>
            <section>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="email">
                            {{ $t('page.reset-password.email') }}
                        </label>
                        <div class="input">
                            <vui-input
                                id="email"
                                v-model="form.email"
                                type="email"
                                name="email"
                                :placeholder="$t('page.reset-password.email.placeholder')"
                                required
                            />
                        </div>
                    </div>
                </fieldset>
            </section>
            <section>
                <fieldset>
                    <div class="fieldset-item fieldset-item--captcha">
                        <label for="captcha">
                            {{ $t('page.reset-password.captcha') }}
                            <img
                                v-if="captcha"
                                :src="svg"
                            >
                        </label>
                        <div class="input">
                            <vui-input
                                id="captcha"
                                v-model="form.captcha"
                                type="text"
                                name="captcha"
                                :placeholder="$t('page.reset-password.captcha.placeholder')"
                                required
                            />
                        </div>
                    </div>
                </fieldset>
            </section>
            <section class="section--submit">
                <vui-button
                    icon="fa-solid fa-key"
                    type="submit"
                    :text="$t('page.reset-password.submit')"
                    @click.prevent="onSubmit"
                />
                <div class="links">
                    <router-link
                        :to="{
                            name: 'ViewRegister',
                            parpagery: {
                                route: $route.query.route
                            }
                        }"
                    >
                        {{ $t('page.reset-password.register') }}
                    </router-link>
                    /
                    <router-link
                        :to="{
                            name: 'ViewLogin',
                            params: {
                                locale
                            },
                            query: {
                                route: $route.query.route
                            }
                        }"
                    >
                        {{ $t('page.reset-password.login') }}
                    </router-link>
                </div>
            </section>
            <vui-alert
                v-if="error"
                icon="fa-solid fa-warning"
                layout="error"
            >
                {{ $t(error) }}
            </vui-alert>
        </vui-form>
    </vui-card>
</template>

<script
    src="./reset.mjs"
/>

<style
    lang="scss"
    src="./reset.scss"
/>
