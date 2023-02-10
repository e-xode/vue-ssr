<template>
    <vui-card
        flat
        class="card--register"
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
                    <div class="fieldset-item">
                        <label for="captcha">
                            {{ $t('page.register.captcha') }}
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
                                :placeholder="$t('page.register.captcha.placeholder')"
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
                    @click.prevent="register"
                />
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
