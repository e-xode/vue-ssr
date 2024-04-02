<template>
    <vui-card
        flat
        class="card--admin-edit"
    >
        <h1>
            <vui-nav
                :items="navItems"
                item-label="label"
                item-value="value"
            />
        </h1>
        <vui-loader
            v-if="isLoading"
        />
        <vui-form
            v-if="!isLoading"
        >
            <section
                v-for="(field, i) in fields"
                :key="`field--${field.name}-${i}`"
            >
                <fieldset>
                    <div
                        v-if="['email', 'number', 'text'].includes(field.html)"
                        class="fieldset-item fieldset-item--text"
                    >
                        <label :for="field.name">
                            {{ $t(`page.admin.edit.${collection.name}.${field.name}`) }}
                        </label>
                        <div class="input">
                            <vui-input
                                v-if="!field.multiple"
                                :value="form[field.name]"
                                :type="field.html"
                                :name="field.name"
                                :required="field.required"
                                :placeholder="$t(`page.admin.edit.${collection.name}.${field.name}`)"
                                @update:model-value="(v) => onChange(field.name, v)"
                            />
                            <textarea
                                v-if="field.multiple"
                                :value="form[field.name]"
                                :name="field.name"
                                :required="field.required"
                                @update:model-value="(v) => onChange(field.name, v)"
                            />
                        </div>
                    </div>
                    <div
                        v-if="field.html === 'date'"
                        class="fieldset-item fieldset-item--text"
                    >
                        <label :for="field.name">
                            {{ $t(`page.admin.edit.${collection.name}.${field.name}`) }}
                        </label>
                        <div class="input">
                            <vui-input
                                :value="dayjs(form[field.name]).toISOString().substring(0, 10)"
                                :type="field.html"
                                :name="field.name"
                                :required="field.required"
                                :placeholder="$t(`page.admin.edit.${collection.name}.${field.name}`)"
                                @update:model-value="(v) => onChange(field.name, v)"
                            />
                        </div>
                    </div>
                    <div
                        v-if="['checkbox'].includes(field.html)"
                        class="fieldset-item"
                    >
                        <label :for="field.name">
                            {{ $t(`page.admin.edit.${collection.name}.${field.name}`) }}
                        </label>
                        <div class="input">
                            <vui-checkbox
                                :value="form[field.name]"
                                :type="field.html"
                                :name="field.name"
                                :required="field.required"
                                @update:model-value="(v) => onChange(field.name, v)"
                            />
                        </div>
                    </div>
                    <div
                        v-if="['select'].includes(field.html)"
                        class="fieldset-item fieldset-item--select"
                    >
                        <label :for="field.name">
                            {{ $t(`page.admin.edit.${collection.name}.${field.name}`) }}
                        </label>
                        <div class="input">
                            <vui-dropdown
                                v-if="!field.itemValue"
                                :value="form[field.name]"
                                :items="field.options"
                                :name="field.name"
                                :placeholder="$t(`page.admin.edit.${collection.name}.${field.name}`)"
                                :required="field.required"
                                return-object
                                @update:model-value="(v) => onChange(field.name, v)"
                            />
                            <vui-dropdown
                                v-if="field.itemValue"
                                :value="form[field.name]"
                                :items="getOptions(field.collection)"
                                :item-label="field.itemLabel"
                                :item-value="field.itemValue"
                                :name="field.name"
                                :placeholder="$t(`page.admin.edit.${collection.name}.${field.name}`)"
                                :required="field.required"
                                :disable-filtering="true"
                                return-object
                                @update:model-value="(v) => onChange(field.name, v)"
                                @input="(e) => onKeywordFilter(e, field.collection)"
                            />
                        </div>
                    </div>
                    <template v-if="['file'].includes(field.html)">
                        <div class="fieldset-item fieldset-item--file">
                            <label :for="field.name">
                                {{ $t(`page.admin.edit.${collection.name}.${field.name}`) }}
                            </label>
                            <div class="input">
                                <input
                                    :type="field.html"
                                    :name="field.name"
                                    :required="field.required"
                                    multiple="multiple"
                                    @change="onFileChange"
                                />
                            </div>
                        </div>
                        <div class="preview">
                            <template v-for="file in form.files">
                                <a
                                    v-if="file?.path"
                                    :key="file.path"
                                    :href="file.path"
                                    target="_blank"
                                    class="file-container"
                                >
                                    <img
                                        :src="file.path"
                                    />
                            </a>
                            </template>
                        </div>
                    </template>
                    <template v-if="['html'].includes(field.html)">
                        <div class="editor">
                            <component-editor
                                v-model="form[field.name]"
                            />
                        </div>
                    </template>
                </fieldset>
            </section>
            <section class="section--submit">
                <vui-button
                    v-if="form._id && form._id !== 'new'"
                    type="button"
                    class="vui-button--delete"
                    @click="onDelete"
                >
                    {{ $t('page.admin.edit.delete') }}
                </vui-button>
                <vui-button
                    type="button"
                    :loading="isLoading"
                    @click="onSubmit"
                >
                    {{ $t('page.admin.edit.save') }}
                </vui-button>
            </section>
        </vui-form>
    </vui-card>
</template>

<script
    src="./edit.mjs"
/>

<style
    lang="scss"
    src="./edit.scss"
/>
