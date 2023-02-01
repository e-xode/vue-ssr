<template>
    <vui-card
        flat
        class="card--account"
    >
        <h1>
            {{ $t('page.account.h1') }}
        </h1>
        <vui-form>
            <section>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="email">
                            {{ $t('page.account.email') }}
                        </label>
                        <div class="input">
                            <vui-input
                                id="email"
                                type="email"
                                name="email"
                                :value="email"
                                :disabled="true"
                            />
                        </div>
                    </div>
                </fieldset>
            </section>
            <section>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="password">
                            {{ $t('page.account.old-password') }}
                        </label>
                        <div class="input">
                            <vui-input
                                id="oldpassword"
                                v-model="form.oldpassword"
                                type="password"
                                name="oldpassword"
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
                            {{ $t('page.account.new-password') }}
                        </label>
                        <div class="input">
                            <vui-input
                                id="newpassword"
                                v-model="form.newpassword"
                                type="password"
                                name="newpassword"
                                required
                            />
                        </div>
                    </div>
                </fieldset>
            </section>
            <section class="section--submit">
                <vui-button
                    type="submit"
                    :text="$t('page.account.submit')"
                    @click.prevent="onSubmit()"
                />
            </section>
            <section>
                <vui-alert
                    v-if="error"
                    icon="fa-solid fa-warning"
                    layout="error"
                >
                    {{ $t(error) }}
                </vui-alert>
                <vui-alert
                    v-if="success"
                    icon="fa-solid fa-check"
                    layout="success"
                >
                    {{ $t('page.account.success') }}
                </vui-alert>
            </section>
        </vui-form>
    </vui-card>
</template>

<script
    src="./account.mjs"
/>

<style
    lang="scss"
    src="./account.scss"
/>
