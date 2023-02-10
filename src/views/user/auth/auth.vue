<template>
    <vui-card
        flat
        class="card--auth"
    >
        <h1>
            <i class="fa-regular fa-envelope" />
            {{ $t('page.auth.h1') }}
        </h1>
        <p>
            {{ $t('page.auth.description') }}
        </p>
        <vui-form>
            <section>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="code">
                            {{ $t('page.auth.code') }}
                        </label>
                        <div class="input">
                            <vui-input
                                id="code"
                                v-model="form.code"
                                type="text"
                                name="code"
                                :placeholder="$t('page.auth.code.placeholder')"
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
                    :text="$t('page.auth.submit')"
                    @click.prevent="auth"
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
    src="./auth.mjs"
/>

<style
    lang="scss"
    src="./auth.scss"
/>
