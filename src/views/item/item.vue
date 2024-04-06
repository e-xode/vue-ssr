<template>
    <div class="view-item">
        <ComponentCategories />
        <vui-loader
            v-if="isLoading"
            :text="$t('app.loading')"
        />
        <template
            v-if="!isLoading"
        >
            <vui-nav
                flat
                :items="nav"
                item-label="label"
                item-value="value"
            />
            <h1>
                {{ item.name }}
            </h1>
            <div
                class="item"
            >
                <div class="card-container">
                    <div
                        v-if="item.files && item.files[0]"
                        class="picture"
                        :style="{ backgroundImage: `url(${item.files[0].path})` }"
                    />
                    <vui-card class="details">
                        <ul>
                            <li>
                                <label>
                                    {{ $t('page.item.color') }}
                                </label>
                                <span class="value">
                                    {{ item.color }}
                                </span>
                            </li>
                            <li>
                                <label>
                                    {{ $t('page.item.size') }}
                                </label>
                                <span class="value">
                                    {{ item.size?.value }}
                                </span>
                            </li>
                            <li>
                                <label>
                                    {{ $t('page.item.quantity') }}
                                </label>
                                <span class="value">
                                    {{ item.quantity }}
                                </span>
                            </li>
                            <li>
                                <label>
                                    {{ $t('page.item.price') }}
                                </label>
                                <span class="value">
                                    {{ item.price }}
                                    {{ $t('app.currency') }}
                                </span>
                            </li>
                            <li v-if="user?.country">
                                <label>
                                    {{ $t('page.item.shipping-fee') }}*
                                </label>
                                <span class="value">
                                    {{ user.country.shippingfee }}
                                    {{ $t('app.currency') }}
                                </span>
                            </li>
                            <li
                                v-if="user?.country"
                                class="shipping-fee-info"
                            >
                                <span>
                                    * {{ $t('page.item.shipping-fee.description', {
                                        countryName: user.country.name
                                    }) }}
                                    <router-link
                                        :to="{ name: 'ViewAccount' }"
                                    >
                                        {{ $t('page.item.shipping-fee.account') }}
                                    </router-link>
                                </span>
                            </li>
                        </ul>
                        <h2>
                            {{ $t('page.item.interested') }}
                        </h2>
                        <template v-if="user?._id">
                            <vui-form v-if="!hasOrderInProgress">
                                <section>
                                    <fieldset>
                                        <div class="fieldset-item">
                                            <label for="email">
                                                {{ $t('page.item.drop-email') }}
                                            </label>
                                            <div class="input">
                                                <vui-input
                                                    :value="user?.email"
                                                    :disabled="true"
                                                    type="text"
                                                    name="email"
                                                    :placeholder="$t('page.item.email.placeholder')"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </fieldset>
                                </section>
                                <section class="section--submit">
                                    <vui-button
                                        type="button"
                                        @click="onOrder"
                                    >
                                        {{ $t('page.item.send') }}
                                    </vui-button>
                                </section>
                                <p>{{ $t('page.item.quote') }}</p>
                            </vui-form>
                            <vui-alert v-if="hasOrderInProgress">
                                <p>
                                    {{ $t('page.item.order-pending') }}
                                </p>
                            </vui-alert>
                        </template>
                        <div
                            v-if="!user?._id"
                            class="login"
                        >
                            <i class="fa-solid fa-paper-plane" />
                            <router-link
                                :to="{
                                    name: 'ViewLogin',
                                    query: { route: $route.fullPath },
                                    params: { locale }
                                }"
                            >
                                {{ $t('page.item.authenticate-to-get-a-quote') }}
                            </router-link>
                        </div>
                    </vui-card>
                </div>
                <div class="social">
                    <a
                        :href="fb"
                        target="_blank"
                        class="facebook"
                    >
                        {{ $t('page.item.share') }}
                        <i class="fa-brands fa-square-facebook" />
                    </a>
                </div>
            </div>
        </template>
    </div>
</template>

<script
    src="./item.mjs"
/>

<style
    lang="scss"
    src="./item.scss"
/>
