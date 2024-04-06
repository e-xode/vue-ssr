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
                                :value="user.email"
                                disabled
                                required
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <div class="fieldset-item">
                        <label for="email">
                            {{ $t('page.account.country') }}
                        </label>
                        <div class="input">
                            <vui-dropdown
                                id="country"
                                v-model="form.country"
                                type="text"
                                name="country"
                                item-label="name"
                                item-value="_id"
                                :items="countries"
                                required
                                return-object
                                :disable-filtering="true"
                                @input="(v) => onCountryKeyword(v)"
                            />
                        </div>
                    </div>
                </fieldset>
            </section>
            <h2>
                {{ $t('page.account.h2-password') }}
            </h2>
            <section>
                <fieldset v-if="user.status === 200">
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
                                :class="{
                                    error: user.status === 449
                                }"
                            />
                        </div>
                    </div>
                    <vui-alert
                        v-if="user.status === 449"
                        icon="fa-solid fa-warning"
                        layout="warning"
                        class="alert--449"
                    >
                        {{ $t('page.account.new-password.449') }}
                    </vui-alert>
                </fieldset>
            </section>
            <section class="section--submit">
                <fieldset>
                    <vui-button
                        type="submit"
                        :text="$t('page.account.submit')"
                        @click.prevent="onSubmit()"
                    />
                </fieldset>
            </section>
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
