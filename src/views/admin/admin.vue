<template>
    <vui-card
        flat
        class="card--admin"
    >
        <h1>
            {{ $t('page.admin.h1') }}
            <div class="submit">
                <div class="vui-button vui-button--default">
                    <router-link
                        class="vui-button-holder"
                        :to="{
                            name: 'ViewAdminEdit',
                            params: {
                                _id: 'new',
                                collection: collection.name,
                                locale
                            }
                        }"
                    >
                        {{ $t('page.admin.create') }}
                    </router-link>
                </div>
            </div>
        </h1>
        <vui-loader
            v-if="isLoading"
        />
        <vui-grid
            v-if="!isLoading"
        >
            <vui-grid-unit
                class="vui-grid-unit--menu"
            >
                <vui-list
                    flat
                    :items="collections"
                    :value="collection.name"
                    :selectable="true"
                    item-label="label"
                    item-value="name"
                />
            </vui-grid-unit>
            <vui-grid-unit
                class="vui-grid-unit--table"
            >
                <div class="table-container">
                    <vui-table
                        :headers="tableHeaders"
                        :items="items"
                    >
                        <template #[`item._id`]="{ item }">
                            <td
                                :data-label="$t('page.admin.table.name')"
                            >
                                <router-link
                                    :to="{
                                        name: 'ViewAdminEdit',
                                        params: {
                                            _id: item._id,
                                            collection: collection.name,
                                            locale
                                        }
                                    }"
                                >
                                    <template v-if="!label.itemLabel">
                                        {{ item[label.name] || 'empty' }}
                                    </template>
                                    <template v-if="label.itemLabel">
                                        {{ item[label.name][label.itemLabel] || 'empty' }}
                                    </template>
                                </router-link>
                            </td>
                        </template>
                        <template #[`item.createdAt`]="{ item }">
                            <td
                                :data-label="$t('page.admin.table.date')"
                            >
                                {{ dayjs(item.createdAt).format($t('app.date-full')) }}
                            </td>
                        </template>
                    </vui-table>
                    <div class="submit">
                        <vui-pager
                            v-model="page"
                            flat
                            :count="paging.total"
                            :size="paging.max"
                            @update:model-value="onPage"
                        />
                    </div>
                </div>
            </vui-grid-unit>
        </vui-grid>
    </vui-card>
</template>

<script
    src="./admin.mjs"
/>

<style
    lang="scss"
    src="./admin.scss"
/>
