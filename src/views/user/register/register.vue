<template>
    <vui-card
        flat
        class="view-register"
    >
        <h1>
            <i class="fa-solid fa-user-plus" />
            {{ $t('page.register.h1') }}
        </h1>
        <vui-form>
            <section>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="email">
                            {{ $t('page.register.email') }}
                        </label>
                        <div class="input">
                            <vui-input
                                id="email"
                                v-model="form.email"
                                type="email"
                                name="email"
                                :placeholder="$t('page.register.email.placeholder')"
                                required
                            />
                        </div>
                    </div>
                </fieldset>
            </section>
            <section>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="email">
                            {{ $t('page.register.country') }}
                        </label>
                        <div class="input">
                            <vui-dropdown
                                id="country"
                                v-model="form.country"
                                name="country"
                                item-label="name"
                                item-value="_id"
                                :items="getCountries"
                                :placeholder="$t('page.register.country.placeholder')"
                                required
                                return-object
                                :disable-filtering="true"
                                @input="(v) => onCountryKeyword(v)"
                            />
                        </div>
                    </div>
                </fieldset>
            </section>
            <section>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="password">
                            {{ $t('page.register.password') }}
                        </label>
                        <div class="input">
                            <vui-input
                                id="password"
                                v-model="form.password"
                                type="password"
                                name="password"
                                :placeholder="$t('page.register.password.placeholder')"
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
                    icon="fa-solid fa-list-check"
                    type="submit"
                    :text="$t('page.register.submit')"
                    @click.prevent="onSubmit"
                />
                <div class="links">
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
                        {{ $t('page.register.login') }}
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
    src="./register.mjs"
/>

<style
    lang="scss"
    src="./register.scss"
/>
