<template>
    <vui-card
        flat
        class="card--login"
    >
        <h1>
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
                    :text="$t('page.login.submit')"
                    @click.prevent="login"
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
    src="./login.mjs"
/>

<style
    lang="scss"
    src="./login.scss"
/>
