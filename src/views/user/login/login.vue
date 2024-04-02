<template>
    <vui-card
        flat
        class="view-login"
    >
        <h1>
            <i class="fa-solid fa-key" />
            {{ $t('page.login.h1') }}
        </h1>
        <vui-form>
            <section>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="email">
                            {{ $t('page.login.email') }}
                        </label>
                        <div class="input">
                            <vui-input
                                id="email"
                                v-model="form.email"
                                type="email"
                                name="email"
                                :placeholder="$t('page.login.email.placeholder')"
                                required
                            />
                        </div>
                    </div>
                </fieldset>
            </section>
            <section>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="password">
                            {{ $t('page.login.password') }}
                        </label>
                        <div class="input">
                            <vui-input
                                id="password"
                                v-model="form.password"
                                type="password"
                                name="password"
                                :placeholder="$t('page.login.password.placeholder')"
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
                            {{ $t('page.login.captcha') }}
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
                                :placeholder="$t('page.login.captcha.placeholder')"
                                required
                            />
                        </div>
                    </div>
                </fieldset>
            </section>
            <section class="section--submit">
                <vui-button
                    icon="fa-solid fa-key"
                    type="button"
                    :text="$t('page.login.submit')"
                    @click.stop="onSubmit"
                />
                <div class="links">
                    <router-link
                        :to="{
                            name: 'ViewReset',
                            params: {
                                locale
                            },
                            query: {
                                route: $route.query.route
                            }
                        }"
                    >
                        {{ $t('page.login.reset-password') }}
                    </router-link>
                    /
                    <router-link
                        :to="{
                            name: 'ViewRegister',
                            params: {
                                locale
                            },
                            query: {
                                route: $route.query.route
                            }
                        }"
                    >
                        {{ $t('page.login.register') }}
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
    src="./login.mjs"
/>

<style
    lang="scss"
    src="./login.scss"
/>
